import { test, expect } from "@playwright/test";

test("ROM connection reports missing host configuration without pretending to persist", async ({ page }) => {
  await page.goto("/#rom");
  await expect(page.getByRole("heading", { name: "Live ROM Resources", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("no live ROM configuration");
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toHaveCount(0);
});

for (const restoredPhase of ["unknown", "prepared"] as const) test(`installed ROM binding retries ${restoredPhase} intent without changing exact command bytes`, async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const profile = document.createElement("script");
      profile.id = "rom-studio-auth-profile";
      profile.type = "application/json";
      const store = (name: string) => ({ name, maxBytes: 65536, maxSlots: 100, timeoutMs: 5000 });
      profile.textContent = JSON.stringify({ version: 1, authority: "gallery-test", recovery: { namespace: "gallery-test", retryEpoch: "1", maxBytes: 16384, intentStore: store("gallery-test-intents"), editorStore: store("gallery-test-editors") } });
      document.body.append(profile);
    });
  });
  let authenticated = true;
  await page.route("**/auth/session", route => route.fulfill({ json: authenticated ? { authenticated: true, generation: "session-one", csrf_token: "fixture", user_id: "visitor-one", expires_at: 4102444800 } : { authenticated: false, generation: "anonymous" } }));
  await page.route("**/auth/providers", route => route.fulfill({ json: { providers: [{ id: "gallery", label: "Gallery" }], primary: null } }));
  const descriptor = { kind: "gallery", version: 1, fields: [{ name: "count", shape: { type: "u64" } }], actions: [], action_inputs: [] };
  const view = '{"key":{"kind":"gallery","id":"exact-resource"},"revision":1,"value":{"count":9007199254740993}}';
  await page.route("**/api/discover", route => route.fulfill({ json: { version: 1, resources: [descriptor] } }));
  await page.route("**/api/query", route => route.fulfill({ body: `[${view}]`, contentType: "application/json" }));
  await page.route("**/api/read", route => route.fulfill({ body: view, contentType: "application/json" }));
  const requests: string[] = [];
  await page.route("**/api/invoke", route => {
    requests.push(route.request().postData()!);
    if (requests.length === 1) return route.abort("failed");
    return route.fulfill({ body: view.replace('"revision":1', '"revision":2'), contentType: "application/json" });
  });
  await page.goto("/#rom");
  await page.getByRole("button", { name: "exact-resource", exact: true }).click();
  const count = page.getByLabel("count value", { exact: true });
  await expect(count).toHaveValue("9007199254740993");
  await count.fill("9007199254740995");
  await page.getByRole("button", { name: "Save 1 change", exact: true }).click();
  await expect(page.getByRole("button", { name: "Retry saved mutation", exact: true })).toBeVisible();
  if (restoredPhase === "prepared") {
    // Seed a valid pre-transport state from the recorded command. Stored bytes grant no authority.
    await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("gallery-test-intents");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(db.objectStoreNames[0], "readwrite");
        const store = tx.objectStore(db.objectStoreNames[0]);
        const request = store.openCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) throw Error("The saved command is missing.");
          const record = cursor.value;
          const payload = JSON.parse(record.payload);
          payload.accepted.phase = "prepared";
          payload.accepted.attempted = false;
          payload.accepted.uncertain = false;
          payload.accepted.knowledge = "not_attempted";
          cursor.update({ version: crypto.randomUUID(), payload: JSON.stringify(payload) });
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
    });
    await page.reload();
    await page.getByRole("button", { name: "exact-resource", exact: true }).click();
    await page.getByRole("button", { name: "Restore saved draft and mutation", exact: true }).click();
    await expect(page.getByText("A saved command is ready to send. It has not been attempted.", { exact: true })).toBeVisible();
  }
  await page.getByRole("button", { name: "Retry saved mutation", exact: true }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1]).toBe(requests[0]);
  expect(requests[0]).toContain("9007199254740995");
  await expect(page.getByText("Resource: exact-resource · Revision: 2", { exact: true })).toBeVisible();
  authenticated = false;
  await page.getByRole("button", { name: "Refresh ROM connection", exact: true }).click();
  await expect(page.getByText("Session: anonymous", { exact: true })).toBeVisible();
  await expect(count).toHaveCount(0);
  await expect(page.getByRole("button", { name: "exact-resource", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Sign in with Gallery", exact: true })).toBeVisible();
});

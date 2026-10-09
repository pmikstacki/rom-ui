import { test, expect, type Page } from "@playwright/test";

const host = process.env.ROM_GALLERY_HOST_URL;
test("dedicated ROM host isolates visitors and persists exact values", async ({ page, browser }) => {
  test.skip(!host, "Requires the dedicated local gallery host and synthetic OIDC provider.");
  const base = new URL(host!);
  expect(base.hostname).toBe("127.0.0.1");
  expect(base.protocol).toBe("http:");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  async function login(target: Page, account: string) {
    await target.goto(`${base.href}#rom`);
    await target.getByRole("link", { name: "Sign in with Gallery account", exact: true }).click();
    await target.getByLabel("Fixture account", { exact: true }).selectOption(account);
    await target.getByRole("button", { name: "Sign in", exact: true }).click();
    await target.getByRole("button", { name: "Allow", exact: true }).click();
    await expect(target).toHaveURL(base.href);
    await target.goto(`${base.href}#rom`);
  }
  await login(page, "alice");
  const discovered = await page.evaluate(async () => {
    const session = await fetch("/auth/session").then(response => response.json());
    const response = await fetch("/api/discover", { method: "POST", headers: { "content-type": "application/json", "x-rom-csrf": session.csrf_token }, body: "{}" });
    return { status: response.status, body: await response.json() };
  });
  expect(discovered.status).toBe(200);
  expect(discovered.body.resources.map((resource: { kind: string }) => resource.kind)).toEqual(["gallery-samples"]);

  await expect(page.getByRole("button", { name: "bob-sample", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "alice-sample", exact: true }).click();
  const count = page.getByLabel("count value", { exact: true });
  const saved = await count.inputValue() === "9007199254740995" ? "9007199254740997" : "9007199254740995";
  await count.fill(saved);
  await page.getByRole("button", { name: "Save 1 change", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeDisabled();
  await page.reload();
  await page.getByRole("button", { name: "alice-sample", exact: true }).click();
  await expect(count).toHaveValue(saved);
  await count.fill(saved);
  await page.getByRole("button", { name: "Save 1 change", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(count).toHaveCount(0);
  const bob = await browser.newPage();
  bob.on("pageerror", error => errors.push(error.message));
  try {
  await login(bob, "bob");
  await expect(bob.getByRole("button", { name: "alice-sample", exact: true })).toHaveCount(0);
  await bob.getByRole("button", { name: "bob-sample", exact: true }).click();
  await expect(bob.getByLabel("count value", { exact: true })).toHaveValue("9007199254740993");
  const denied = await bob.evaluate(async () => {
    const session = await fetch("/auth/session").then(response => response.json());
    const response = await fetch("/api/read", { method: "POST", headers: { "content-type": "application/json", "x-rom-csrf": session.csrf_token }, body: JSON.stringify({ kind: "gallery-samples", id: "alice-sample" }) });
    return { status: response.status, body: await response.text() };
  });
  expect(denied.status).toBe(403);
  expect(denied.body).not.toContain(saved);
  expect(errors).toEqual([]);
  } finally { await bob.close(); }
});

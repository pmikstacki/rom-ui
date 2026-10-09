import { test, expect, type Page } from "@playwright/test";

import { loginGallery } from "./rom-host-login";

const host = process.env.ROM_GALLERY_HOST_URL;
test("dedicated ROM host isolates visitors and persists exact values", async ({ page, browser }) => {
  test.skip(!host, "Requires the dedicated local gallery host and synthetic OIDC provider.");
  const base = new URL(host!);
  expect(base.hostname).toBe("127.0.0.1");
  expect(base.protocol).toBe("http:");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const login = (target: Page, account: string) => loginGallery(target, base, account);
  await login(page, "alice");
  const discovered = await page.evaluate(async () => {
    const session = await fetch("/auth/session").then(response => response.json());
    const response = await fetch("/api/discover", { method: "POST", headers: { "content-type": "application/json", "x-rom-csrf": session.csrf_token }, body: "{}" });
    return { status: response.status, body: await response.json() };
  });
  expect(discovered.status).toBe(200);
  expect(discovered.body.resources.map((resource: { kind: string }) => resource.kind).sort()).toEqual(["gallery-fields", "gallery-samples", "gallery-tasks", "gallery-workflows"]);

  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-samples");
  await expect(page.getByRole("button", { name: "bob-sample", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "alice-sample", exact: true }).click();
  const count = page.getByLabel("count value", { exact: true });
  const saved = await count.inputValue() === "9007199254740995" ? "9007199254740997" : "9007199254740995";
  await count.fill(saved);
  await page.getByRole("button", { name: "Save 1 change", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeDisabled();
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-samples");
  await page.getByRole("button", { name: "alice-sample", exact: true }).click();
  await expect(count).toHaveValue(saved);
  await count.fill(saved);
  await page.getByRole("button", { name: "Save 1 change", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeDisabled();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-fields");
  await expect(page.getByRole("button", { name: "bob-fields", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "alice-fields", exact: true }).click();
  const chooseSample = page.getByRole("button", { name: "Choose sample reference", exact: true });
  if (await chooseSample.count() === 0) {
    await page.getByRole("button", { name: "sample options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Set a value", exact: true }).click();
  }
  await chooseSample.click();
  await expect(page.getByRole("option", { name: /Bob's sample/ })).toHaveCount(0);
  await page.getByRole("option", { name: /Alice's sample/ }).click();
  await expect(page.getByText("Alice's sample", { exact: true })).toBeVisible();
  const decimal = page.getByRole("textbox", { name: "decimal value", exact: true });
  await expect(decimal).toHaveValue("12345678901234567890.123456789");
  const title = page.getByRole("textbox", { name: "name value", exact: true });
  const renamed = "Rich fields " + Date.now();
  await title.fill(renamed);
  await expect(page.getByText("Alice's sample", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save 2 changes", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeDisabled();
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-fields");
  await page.getByRole("button", { name: "alice-fields", exact: true }).click();
  await expect(title).toHaveValue(renamed);
  await expect(decimal).toHaveValue("12345678901234567890.123456789");
  const measurement = "13.250000000000000001";
  await page.getByRole("button", { name: "input mode", exact: true }).click();
  await page.getByRole("option", { name: "Set value", exact: true }).click();
  await page.getByRole("textbox", { name: "input value", exact: true }).fill(measurement);
  await page.getByRole("textbox", { name: "input unit", exact: true }).fill("kg");
  await page.getByRole("button", { name: "Run measure", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "measurement value", exact: true })).toHaveValue(measurement);
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-fields");
  await page.getByRole("button", { name: "alice-fields", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "measurement value", exact: true })).toHaveValue(measurement);
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-tasks");
  await expect(page.getByRole("button", { name: "bob-task", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "alice-task", exact: true }).click();
  const activity = page.getByRole("region", { name: "ROM agent activity", exact: true });
  await expect(activity).toBeVisible();
  if (await activity.getByRole("status").textContent() === "canceled") {
    await page.getByRole("button", { name: "Restore saved draft and mutation", exact: true }).click();
    await page.getByRole("button", { name: "Retry ROM task", exact: true }).click();
    await expect(activity.getByRole("status")).toHaveText("running");
  }
  await page.getByRole("button", { name: "Cancel ROM task", exact: true }).click();
  await expect(activity.getByRole("status")).toHaveText("canceled");
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-tasks");
  await page.getByRole("button", { name: "alice-task", exact: true }).click();
  await expect(activity.getByRole("status")).toHaveText("canceled");
  await page.getByRole("button", { name: "Retry ROM task", exact: true }).click();
  await expect(activity.getByRole("status")).toHaveText("running");
  await page.getByRole("button", { name: "Start live task updates", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop live task updates", exact: true })).toBeVisible();
  const other = await page.context().newPage();
  try {
    await other.goto(base.href + "#rom");
    await other.getByLabel("Resource kind", { exact: true }).selectOption("gallery-tasks");
    await other.getByRole("button", { name: "alice-task", exact: true }).click();
    await other.getByRole("button", { name: "Cancel ROM task", exact: true }).click();
    await expect(activity.getByRole("status")).toHaveText("canceled");
    await page.getByRole("button", { name: "Restore saved draft and mutation", exact: true }).click();
    await page.getByRole("button", { name: "Retry ROM task", exact: true }).click();
    await expect(activity.getByRole("status")).toHaveText("running");
  } finally { await other.close(); }
  await page.getByRole("button", { name: "Stop live task updates", exact: true }).click();

  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(count).toHaveCount(0);
  const bob = await browser.newPage();
  bob.on("pageerror", error => errors.push(error.message));
  try {
  await login(bob, "bob");
  await bob.getByLabel("Resource kind", { exact: true }).selectOption("gallery-samples");
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

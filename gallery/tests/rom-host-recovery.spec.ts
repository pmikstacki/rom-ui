import { test, expect } from "@playwright/test";
import { loginGallery } from "./rom-host-login";

const host = process.env.ROM_GALLERY_HOST_URL;
test("lost acknowledgement retries the original command and keeps controls disabled through refresh", async ({ page }) => {
  test.skip(!host, "Requires the local ROM host and synthetic OIDC provider.");
  const base = new URL(host!);
  expect(base.hostname).toBe("127.0.0.1");
  expect(base.protocol).toBe("http:");
  await loginGallery(page, base, "alice");
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-samples");
  await page.getByRole("button", { name: "alice-sample", exact: true }).click();
  const count = page.getByLabel("count value", { exact: true });
  const saved = await count.inputValue() === "9007199254740995" ? "9007199254740997" : "9007199254740995";
  const commands: string[] = [];
  await page.route("**/api/invoke", async route => {
    commands.push(route.request().postData()!);
    if (commands.length === 1) {
      // Commit through the actual backend, then lose only its acknowledgement.
      const response = await route.fetch();
      expect(response.status()).toBe(200);
      await response.body();
      await route.abort("failed");
    } else await route.continue();
  });
  await count.fill(saved);
  await page.getByRole("button", { name: "Save 1 change", exact: true }).click();
  const retry = page.getByRole("button", { name: "Retry saved mutation", exact: true });
  await expect(retry).toBeVisible();
  let release!: () => void;
  const gate = new Promise<void>(resolve => release = resolve);
  let queryStarted!: () => void;
  const reached = new Promise<void>(resolve => queryStarted = resolve);
  await page.route("**/api/query", async route => {
    queryStarted();
    await gate;
    await route.continue();
  });
  try {
    await retry.click();
    await reached;
    await expect(count).toHaveValue(saved);
    await expect(page.getByTestId("rom-update-pending")).toBeVisible();
    await expect(count).toBeDisabled();
    expect(commands).toHaveLength(2);
    expect(commands[1]).toBe(commands[0]);
  } finally { release(); }
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await page.unroute("**/api/query");
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-samples");
  await page.getByRole("button", { name: "alice-sample", exact: true }).click();
  await expect(count).toHaveValue(saved);
  await expect(retry).toHaveCount(0);
});

import { test, expect } from "@playwright/test";
import { loginGallery } from "./rom-host-login";

test("ROM map selection persists with actual host authorization", async ({ page }) => {
  const host = process.env.ROM_GALLERY_HOST_URL;
  test.skip(!host, "Requires the local ROM host and synthetic OIDC provider.");
  const base = new URL(host!);
  expect(base.hostname).toBe("127.0.0.1");
  // A controlled image fixture avoids automated traffic to the public tile service.
  await page.route("https://tile.openstreetmap.org/**", route => route.fulfill({
    contentType: "image/png",
    body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=", "base64"),
  }));
  await loginGallery(page, base, "alice");
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-maps");
  await expect(page.getByRole("button", { name: "bob-map", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "alice-map", exact: true }).click();
  const map = page.getByRole("region", { name: "ROM map", exact: true });
  await expect(map.getByRole("link", { name: "© OpenStreetMap contributors", exact: true })).toBeVisible();
  const selected = page.getByTestId("rom-map-selection");
  const next = await selected.textContent() === "wawel" ? "old-town" : "wawel";
  await map.getByRole("button", { name: next === "wawel" ? "Wawel Castle" : "Old Town", exact: true }).click();
  await expect(selected).toHaveText(next);
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-maps");
  await page.getByRole("button", { name: "alice-map", exact: true }).click();
  await expect(selected).toHaveText(next);
});

import { test, expect } from "@playwright/test";
test("shared dialog and sheet retain drafts and return focus; notifications can be dismissed", async ({ page }) => {
  await page.goto("/#overlays");
  const open = page.getByRole("button", { name: "Open dialog", exact: true });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Resource note", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Note", { exact: true }).fill("Keep my local draft");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
  await open.click();
  await expect(dialog.getByLabel("Note", { exact: true })).toHaveValue("Keep my local draft");
  await dialog.getByRole("button", { name: "Accept locally", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Accepted locally");
  await page.getByRole("button", { name: "Dismiss notification", exact: true }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
  const sheetOpen = page.getByRole("button", { name: "Open sheet", exact: true });
  await sheetOpen.click();
  await expect(page.getByRole("dialog", { name: "Resource details", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheetOpen).toBeFocused();
  const popoverOpen = page.getByRole("button", { name: "Open popover", exact: true });
  await popoverOpen.click();
  await expect(page.getByText("Host-supplied options for this example.", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popoverOpen).toBeFocused();
});

test("dialog content respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#overlays");
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Resource note", exact: true });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => getComputedStyle(element).animationName)).toBe("none");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open dialog", exact: true })).toBeFocused();
});

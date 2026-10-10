import { test, expect } from "@playwright/test";

test("catalog keeps overview, search and keyboard navigation aligned", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator(".category-card");
  const families = page.getByRole("navigation", { name: "Component gallery" }).getByRole("button");
  await expect(cards).toHaveCount((await families.count()) - 1);
  await expect(families.first().locator(".nav-count")).toHaveText("10");
  await page.getByRole("searchbox", { name: "Search components" }).fill("semantic");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Forms");
  await cards.first().focus();
  await cards.first().press("Enter");
  await expect(page).toHaveURL(/#forms$/);
  await expect(page.getByRole("heading", { name: "Forms", exact: true })).toBeVisible();
  await expect(page.locator("#main")).toBeFocused();
  await expect(page.locator(".showcase")).toHaveCount(2);
  await page.goBack();
  await expect(page).toHaveTitle("Overview · ROM UI");
});

test("shared previews respect reduced motion and retain working controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#controls");
  await expect(page.locator(".showcase")).toHaveCount(4);
  for (const panel of await page.locator(".showcase").all()) {
    await expect(panel).toHaveCSS("animation-name", "none");
  }
  await page.getByLabel("Project name").fill("Shared preview");
  await expect(page.getByTestId("control-value")).toHaveText("Shared preview");
  await page.getByRole("button", { name: "Compositions", exact: true }).click();
  await expect(page.locator("#main")).toBeFocused();
  await expect(page.locator(".showcase")).toHaveCount(5);
});

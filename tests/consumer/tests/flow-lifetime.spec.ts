import { test, expect } from "@playwright/test";
for (const transition of ["Deactivate fitting", "Unmount fitting"]) {
  test(`empty graph fit does not leak across ${transition}`, async ({
    page,
  }) => {
    await page.goto("/flow-lifetime.html");
    const viewport = page.locator(".svelte-flow__viewport");
    await expect(viewport).toBeVisible();
    await page.waitForTimeout(150); // Allow the initial double RAF to hand off its request.
    const before = await viewport.getAttribute("style");
    await page.getByRole("button", { name: transition, exact: true }).click();
    await page
      .getByRole("button", { name: "Load replacement graph", exact: true })
      .click();
    await expect(
      page.getByText("Replacement node", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(150); // Replacement nodes must initialize without replaying an old fit.
    await expect(viewport).toHaveAttribute("style", before!);
  });
}

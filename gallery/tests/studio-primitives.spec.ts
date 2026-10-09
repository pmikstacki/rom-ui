import { expect, test } from "@playwright/test";
test("shared Studio primitives are reachable and interactive in the English gallery", async ({
  page,
}) => {
  await page.goto("/#studio-primitives");
  const demo = page.getByRole("region", {
    name: "Shared Studio primitives",
    exact: true,
  });
  await expect(
    demo.getByRole("heading", { name: "Shared Studio primitives" }),
  ).toBeVisible();
  const control = demo.getByRole("switch", { name: "Live updates" });
  await control.focus();
  await page.keyboard.press("Space");
  await expect(control).toBeChecked();
  await demo
    .getByRole("button", { name: "Resource view", exact: true })
    .click();
  await page.getByRole("option", { name: "Second view", exact: true }).click();
  await expect(demo.getByTestId("primitive-state")).toContainText(
    '"choice":"second"',
  );
  await demo
    .getByRole("button", { name: "Confirm change", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Keep resource", exact: true })
    .click();
  await expect(demo.getByTestId("primitive-state")).toContainText(
    '"changes":0',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = demo.getByRole("button", {
    name: "Toggle resource navigation",
    exact: true,
  });
  await toggle.click();
  await expect(
    page.getByRole("dialog", { name: "Sidebar", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
});

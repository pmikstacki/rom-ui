import { test, expect } from "@playwright/test";
test("controlled viewport changed during movement applies when motion ends", async ({
  page,
}) => {
  await page.goto("/maps-lifetime.html");
  await expect(
    page.getByRole("region", { name: "Fixture map" }),
  ).toHaveAttribute("data-rom-map-ready", "true");
  await page
    .getByRole("button", { name: "Change controlled viewport during movement" })
    .click();
  await expect(page.getByTestId("during-motion")).toHaveText("true");
  await expect(page.getByTestId("zoom")).toHaveText("8.00");
});
test("arc interaction can be enabled after mounting and disabled again", async ({
  page,
}) => {
  await page.goto("/maps-lifetime.html");
  await expect(
    page.getByRole("region", { name: "Fixture map" }),
  ).toHaveAttribute("data-rom-map-ready", "true");
  await expect(page.getByTestId("hit-layer")).toHaveText("false");
  await page.getByRole("button", { name: "Toggle arc interaction" }).click();
  await expect(page.getByTestId("hit-layer")).toHaveText("true");
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(page.getByTestId("arc-click")).toHaveText("exact/arc");
  await page.getByRole("button", { name: "Toggle arc interaction" }).click();
  await expect(page.getByTestId("hit-layer")).toHaveText("false");
});

test("changing the GeoJSON URL replaces the displayed dataset", async ({
  page,
}) => {
  await page.goto("/maps-lifetime.html");
  await expect(page.getByTestId("dataset")).toHaveText("A");
  await page.getByRole("button", { name: "Change GeoJSON URL" }).click();
  await expect(page.getByTestId("dataset")).toHaveText("B");
});

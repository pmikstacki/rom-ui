import { test, expect } from "@playwright/test";

test("real MapLibre map renders synthetic ROM resources and keyboard selection", async ({
  page,
}) => {
  await page.goto("/?basemap=schematic#maps");
  await expect(
    page.getByRole("heading", { name: "Maps", exact: true }),
  ).toBeVisible();
  const map = page.getByRole("region", { name: "Resource map", exact: true });
  await expect(map).toHaveAttribute("data-rom-map-ready", "true");
  await expect(map.locator("canvas")).toBeVisible();
  const point = page.getByRole("button", { name: "Point A", exact: true });
  await point.focus();
  await point.press("Enter");
  await expect(point).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("map-selection")).toHaveText("resource/a");
});

test("map selection rejection and unknown outcome preserve host state until explicit recovery", async ({
  page,
}) => {
  await page.goto("/?basemap=schematic#maps");
  await expect(
    page.getByRole("region", { name: "Resource map", exact: true }),
  ).toHaveAttribute("data-rom-map-ready", "true");
  await page.getByRole("button", { name: "Point A", exact: true }).click();
  await expect(page.getByTestId("map-selection")).toHaveText("resource/a");
  await page
    .getByRole("checkbox", { name: "Simulate rejected selection" })
    .check();
  await page.getByRole("button", { name: "Point B", exact: true }).click();
  await expect(
    page.getByText("Resource selection was rejected.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("map-selection")).toHaveText("resource/a");
  await page
    .getByRole("checkbox", { name: "Simulate rejected selection" })
    .uncheck();
  await page
    .getByRole("checkbox", { name: "Simulate unknown outcome" })
    .check();
  await page.getByRole("button", { name: "Point C", exact: true }).click();
  await expect(
    page.getByText("Confirm the selection outcome before continuing.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Point A", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Confirm outcome", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Point A", exact: true }),
  ).toBeEnabled();
});

test("theme and responsive transitions retain map layers and do not fetch hidden default providers", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (request) => {
    if (
      new URL(request.url()).origin !==
        new URL(page.url() === "about:blank" ? "http://127.0.0.1" : page.url())
          .origin &&
      !request.isNavigationRequest()
    )
      remote.push(request.url());
  });
  await page.goto("/?basemap=schematic#maps");
  const map = page.getByRole("region", { name: "Resource map", exact: true });
  await expect(map).toHaveAttribute("data-rom-map-ready", "true");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(map).toHaveAttribute("data-rom-map-ready", "true");
  await expect(
    page.getByRole("button", { name: "Point A", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(map.locator("canvas")).toBeVisible();
  expect(remote).toEqual([]);
  await page.goto("/#controls");
  await expect(page.getByLabel("Project name")).toBeVisible();
});

test("clusters render on a tileless style without implicit font requests", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/?basemap=schematic#maps");
  await expect(
    page.getByRole("region", { name: "Resource map", exact: true }),
  ).toHaveAttribute("data-rom-map-ready", "true");
  await page.getByRole("checkbox", { name: "Show clusters" }).check();
  await expect
    .poll(async () =>
      Number(await page.getByTestId("map-cluster-count").textContent()),
    )
    .toBeGreaterThan(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("street basemap renders geographic features and attribution, with a schematic fallback", async ({
  page,
}) => {
  await page.goto("/#maps");
  const map = page.getByRole("region", { name: "Resource map", exact: true });
  await expect(map).toHaveAttribute("data-rom-map-ready", "true", {
    timeout: 20000,
  });
  const canvas = page.locator(".map-canvas");
  await expect
    .poll(
      async () => Number(await canvas.getAttribute("data-basemap-features")),
      { timeout: 20000 },
    )
    .toBeGreaterThan(5);
  await expect(map.getByRole("link", { name: "OpenStreetMap" })).toBeVisible();
  await page.getByRole("button", { name: "Point A", exact: true }).click();
  await expect(page.getByTestId("map-selection")).toHaveText("resource/a");
  await page
    .getByRole("combobox", { name: "Basemap" })
    .selectOption("schematic");
  await expect(map).toHaveAttribute("data-rom-map-ready", "true");
  await expect(canvas).toHaveAttribute("data-basemap", "schematic");
  await expect(
    page.getByRole("button", { name: "Point A", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("an unavailable street provider can recover into the schematic view", async ({
  page,
}) => {
  await page.route("https://tiles.openfreemap.org/styles/**", (route) =>
    route.abort(),
  );
  await page.goto("/#maps");
  await expect(page.getByRole("alert")).toContainText("Try the schematic view");
  await page
    .getByRole("combobox", { name: "Basemap" })
    .selectOption("schematic");
  await expect(
    page.getByRole("region", { name: "Resource map", exact: true }),
  ).toHaveAttribute("data-rom-map-ready", "true");
  await expect(
    page.getByRole("button", { name: "Point A", exact: true }),
  ).toBeVisible();
});

test("gallery light theme overrides a dark operating-system preference", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/?basemap=schematic#maps");
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(
    page.getByRole("region", { name: "Resource map", exact: true }),
  ).toHaveAttribute("data-rom-map-ready", "true");
});

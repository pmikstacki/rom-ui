import { test, expect } from "@playwright/test";

test("real MapLibre map renders synthetic ROM resources and keyboard selection", async ({
  page,
}) => {
  await page.goto("/#maps");
  await expect(
    page.getByRole("heading", { name: "Mapy", exact: true }),
  ).toBeVisible();
  const map = page.getByRole("region", { name: "Mapa zasobów", exact: true });
  await expect(map).toHaveAttribute("data-rom-map-ready", "true");
  await expect(map.locator("canvas")).toBeVisible();
  const point = page.getByRole("button", { name: "Punkt A", exact: true });
  await point.focus();
  await point.press("Enter");
  await expect(point).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("map-selection")).toHaveText("resource/a");
});

test("map selection rejection and unknown outcome preserve host state until explicit recovery", async ({
  page,
}) => {
  await page.goto("/#maps");
  await expect(
    page.getByRole("region", { name: "Mapa zasobów", exact: true }),
  ).toHaveAttribute("data-rom-map-ready", "true");
  await page.getByRole("button", { name: "Punkt A", exact: true }).click();
  await expect(page.getByTestId("map-selection")).toHaveText("resource/a");
  await page
    .getByRole("checkbox", { name: "Symuluj odrzucenie wyboru" })
    .check();
  await page.getByRole("button", { name: "Punkt B", exact: true }).click();
  await expect(
    page.getByText("Nie wybrano zasobu.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("map-selection")).toHaveText("resource/a");
  await page
    .getByRole("checkbox", { name: "Symuluj odrzucenie wyboru" })
    .uncheck();
  await page.getByRole("checkbox", { name: "Symuluj wynik nieznany" }).check();
  await page.getByRole("button", { name: "Punkt C", exact: true }).click();
  await expect(
    page.getByText("Wynik wyboru wymaga potwierdzenia.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Punkt A", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Potwierdź wynik", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Punkt A", exact: true }),
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
  await page.goto("/#maps");
  const map = page.getByRole("region", { name: "Mapa zasobów", exact: true });
  await expect(map).toHaveAttribute("data-rom-map-ready", "true");
  await page.getByRole("button", { name: "Zmień motyw" }).click();
  await expect(map).toHaveAttribute("data-rom-map-ready", "true");
  await expect(
    page.getByRole("button", { name: "Punkt A", exact: true }),
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
  await expect(page.getByLabel("Nazwa projektu")).toBeVisible();
});

test("clusters render on a tileless style without implicit font requests", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/#maps");
  await expect(
    page.getByRole("region", { name: "Mapa zasobów", exact: true }),
  ).toHaveAttribute("data-rom-map-ready", "true");
  await page.getByRole("checkbox", { name: "Pokaż klastry" }).check();
  await expect
    .poll(async () =>
      Number(await page.getByTestId("map-cluster-count").textContent()),
    )
    .toBeGreaterThan(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(errors).toEqual([]);
});

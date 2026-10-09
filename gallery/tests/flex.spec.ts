import { test, expect } from "@playwright/test";

test("accepted native view changes preserve caller content and focus", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = document.startViewTransition?.bind(document);
    const metrics = window as Window & { __flexNativeCalls: number | null };
    metrics.__flexNativeCalls = original ? 0 : null;
    if (original)
      document.startViewTransition = (update) => {
        metrics.__flexNativeCalls = (metrics.__flexNativeCalls ?? 0) + 1;
        return original(update);
      };
  });
  await page.goto("/#flex");
  await page.getByRole("button", { name: "Show details", exact: true }).click();
  await expect(page.getByTestId("flex-current")).toHaveText("Details");
  await expect(page.getByTestId("flex-current")).toBeFocused();
  await expect(
    page.getByRole("region", { name: "Example resource view" }),
  ).toHaveAttribute("data-rom-flex-scope", "document");
  const nativeCalls = await page.evaluate(
    () =>
      (window as Window & { __flexNativeCalls: number | null })
        .__flexNativeCalls,
  );
  if (nativeCalls !== null) expect(nativeCalls).toBeGreaterThan(0);
});
test("application rejection leaves the previous view intact", async ({
  page,
}) => {
  await page.goto("/#flex");
  await page
    .getByRole("checkbox", { name: "Reject the next view change" })
    .check();
  await page.getByRole("button", { name: "Show details", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "The application rejected this change.",
  );
  await expect(page.getByTestId("flex-current")).toHaveText("Overview");
});
test("unsupported snapshots use Animotion and rapid switches finish in order", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "startViewTransition", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("/#flex");
  await page.getByRole("button", { name: "Show details", exact: true }).click();
  await page
    .getByRole("button", { name: "Show activity", exact: true })
    .click();
  await expect(page.getByTestId("flex-current")).toHaveText("Activity");
  await expect(
    page.getByRole("region", { name: "Example resource view" }),
  ).toHaveCSS("opacity", "1");
});
test("reduced motion retains functional navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#flex");
  await page
    .getByRole("button", { name: "Show activity", exact: true })
    .click();
  await expect(page.getByTestId("flex-current")).toHaveText("Activity");
  await expect(
    page.getByRole("region", { name: "Example resource view" }),
  ).toHaveCSS("opacity", "1");
});

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/studio-primitives.html");
});

test("shared switch and select preserve bindings, disabled state and popup focus", async ({
  page,
}) => {
  const control = page.getByRole("switch", { name: "Live updates" });
  await control.focus();
  await page.keyboard.press("Space");
  await expect(control).toBeChecked();
  const select = page.getByRole("button", {
    name: "Resource view",
    exact: true,
  });
  await select.click();
  await page.getByRole("option", { name: "Second view" }).click();
  await expect(select).toContainText("second");
  await expect(select).toBeFocused();
  await expect(page.getByRole("option")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(control).toBeDisabled();
  await expect(select).toBeDisabled();
  await expect(page.getByTestId("primitive-state")).toContainText(
    '"choice":"second"',
  );
});

test("shared tabs and menu support keyboard interaction without invoking disabled actions", async ({
  page,
}) => {
  await page.getByRole("tab", { name: "Details", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "History", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveText(
    "Committed resource history",
  );
  const trigger = page.getByRole("button", {
    name: "Resource actions",
    exact: true,
  });
  await trigger.click();
  await expect(
    page.getByRole("menuitem", { name: "Unavailable action" }),
  ).toHaveAttribute("aria-disabled", "true");
  await page
    .getByRole("menuitem", { name: "Inspect resource", exact: true })
    .click();
  await expect(page.getByTestId("primitive-state")).toContainText(
    '"changes":1',
  );
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("shared confirmation retains focus, cancel leaves host state unchanged and confirm invokes once", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Confirm change",
    exact: true,
  });
  await trigger.click();
  await expect(
    page.getByRole("alertdialog", { name: "Confirm resource change" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Keep resource", exact: true })
    .click();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("primitive-state")).toContainText(
    '"changes":0',
  );
  await trigger.click();
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
  await expect(page.getByTestId("primitive-state")).toContainText(
    '"changes":1',
  );
  await expect(trigger).toBeFocused();
});

test("shared status and projection controls retain exact host text and native anchor refs", async ({
  page,
}) => {
  await expect(
    page.getByRole("link", { name: "Resource badge" }),
  ).toHaveAttribute("href", "#destination");
  await expect(page.getByTestId("badge-ref")).toHaveText("A");
  await expect(page.getByRole("alert")).toContainText("Save rejected");
  await expect(page.getByRole("table")).toContainText("9007199254740993");
  await expect(page.getByRole("navigation")).toContainText("Current resource");
  await expect(page.getByRole("separator")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Explain state", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Explain state", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText(
    "The host owns authorization.",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("shared sidebar preserves desktop state and returns mobile focus to the host trigger", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Toggle resource navigation",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByTestId("primitive-state")).toContainText(
    '"sidebarOpen":false',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Sidebar", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Choose resource", exact: true })
    .click();
  await expect(page.getByTestId("primitive-state")).toContainText(
    '"changes":1',
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("embedded sidebars can opt out of global shortcuts and shared cookies", async ({
  page,
  context,
}) => {
  await page.keyboard.press("Control+b");
  await expect(page.getByTestId("primitive-state")).toContainText(
    '"sidebarOpen":false',
  );
  await expect(page.getByTestId("embedded-state")).toHaveText("true");
  await page
    .getByRole("button", { name: "Toggle resource navigation", exact: true })
    .click();
  expect(
    (await context.cookies()).find((cookie) => cookie.name === "sidebar_state")
      ?.value,
  ).toBe("true");
  await page
    .getByRole("button", { name: "Toggle embedded navigation", exact: true })
    .click();
  await expect(page.getByTestId("embedded-state")).toHaveText("false");
  expect(
    (await context.cookies()).find((cookie) => cookie.name === "sidebar_state")
      ?.value,
  ).toBe("true");
});

import { expect, test } from "@playwright/test";
import { componentExamples } from "../src/component-examples";

const expected = {
  controls: [
    "Button",
    "Input",
    "Textarea",
    "NativeSelect",
    "NativeSelectOption",
    "NativeSelectOptGroup",
    "Checkbox",
    "Slider",
    "Label",
    "Badge",
    "Switch",
  ],
  "studio-primitives": [
    "Badge",
    "Switch",
    "Select",
    "Tabs",
    "DropdownMenu",
    "AlertDialog",
    "Alert",
    "Card",
    "Breadcrumb",
    "Table",
    "Tooltip",
    "Separator",
    "Skeleton",
    "Sidebar",
  ],
  compositions: [
    "ResponsiveDetails",
    "HistoryList",
    "SelectionCard",
    "LayoutControls",
    "ReferencePicker",
    "ConversationLayout",
  ],
  chat: ["ConversationLayout", "ChatComposer", "ChatMessages", "AgentActivity"],
  flow: ["FlowChoiceNode", "FlowFit"],
  flex: ["ROMUIFlex", "FlexView"],
  maps: [
    "Map",
    "MapMarker",
    "MarkerContent",
    "MarkerPopup",
    "MarkerTooltip",
    "MarkerLabel",
    "MapControls",
    "MapPopup",
    "MapRoute",
    "RouteProgress",
    "RouteMarker",
    "MapClusterLayer",
    "MapArc",
    "MapGeoJSON",
    "ResourceMap",
    "useMap",
  ],
};

for (const [category, names] of Object.entries(expected)) {
  test(`${category} has a copyable example for every listed export`, async ({
    page,
  }) => {
    await page.goto(`/#${category}`);
    const usage = page.getByRole("region", {
      name: "Component usage examples",
    });
    await expect(usage.locator("details")).toHaveCount(names.length);
    for (const name of names) {
      const detail = usage.locator(`details[data-component="${name}"]`);
      await detail.locator("summary").click();
      await expect(
        detail.getByRole("button", {
          name: `Copy ${name} example`,
          exact: true,
        }),
      ).toBeVisible();
      const code = await detail.locator("pre code").textContent();
      expect(code).toContain(name);
      expect(code).toContain('from "rom-ui/');
      expect(code).toContain("<script");
      // Render code as text, without creating executable script elements.
      await expect(detail.locator("script")).toHaveCount(0);
    }
  });
}

test("copy writes the complete selected example and announces success", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copiedExample: string }).copiedExample = text;
        },
      },
    });
  });
  await page.goto("/#controls");
  const detail = page.locator('details[data-component="Button"]');
  await detail.locator("summary").click();
  await detail.getByRole("button", { name: "Copy Button example" }).click();
  await expect(detail.getByRole("status")).toHaveText("Copied to clipboard.");
  expect(
    await page.evaluate(
      () => (window as unknown as { copiedExample: string }).copiedExample,
    ),
  ).toBe(componentExamples.controls[0].code);
});

for (const unavailable of [false, true]) {
  test(`copy ${unavailable ? "without clipboard access" : "rejection"} keeps selectable code and announces recovery`, async ({
    page,
  }) => {
    await page.addInitScript((missing) => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: missing
          ? undefined
          : {
              writeText: async () => {
                throw new Error("Access denied");
              },
            },
      });
    }, unavailable);
    await page.goto("/#controls");
    const detail = page.locator('details[data-component="Input"]');
    await detail.locator("summary").click();
    const button = detail.getByRole("button", { name: "Copy Input example" });
    await button.click();
    await expect(detail.getByRole("status")).toHaveText(
      "Could not copy. Select the code and copy it manually.",
    );
    await expect(button).toBeEnabled();
    await expect(detail.locator("pre")).toContainText("bind:value={name}");
  });
}

test("expanded examples fit a mobile viewport in the dark theme", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#maps");
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  const usage = page.getByRole("region", { name: "Component usage examples" });
  for (const summary of await usage.locator("summary").all())
    await summary.click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const pre = usage.locator("pre").first();
  await pre.focus();
  await expect(pre).toBeFocused();
});

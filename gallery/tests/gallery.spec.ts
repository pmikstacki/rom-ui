import { test, expect } from "@playwright/test";

test("gallery navigation, theme and controls are usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Overview · ROM UI");
  await expect(
    page.getByRole("heading", {
      name: "Components that fit your application.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await page.getByLabel("Project name").fill("My project");
  await expect(page.getByTestId("control-value")).toHaveText("My project");
});

test("chat submits text, preserves Shift+Enter and ignores IME Enter", async ({
  page,
}) => {
  await page.goto("/#chat");
  const composer = page.getByRole("textbox", { name: "Message" });
  await composer.fill("Hello");
  await composer.press("Shift+Enter");
  await expect(composer).toHaveValue("Hello\n");
  await composer.dispatchEvent("compositionstart");
  await composer.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(composer).toHaveValue("Hello\n");
  await expect(
    page
      .getByRole("region", { name: "Conversation messages", exact: true })
      .getByText("Hello", { exact: true }),
  ).toHaveCount(0);
  await composer.dispatchEvent("compositionend");
  await composer.press("Enter");
  await expect(
    page
      .getByRole("region", { name: "Conversation messages", exact: true })
      .getByText("Hello", { exact: true }),
  ).toBeVisible();
  await expect(composer).toHaveValue("");
  await expect(
    page
      .getByRole("region", { name: "Conversation messages", exact: true })
      .getByText("This is a local demo response.", { exact: false })
      .last(),
  ).toBeVisible();
});

test("chat failures retain drafts, pending completion does not erase a changed draft", async ({
  page,
}) => {
  await page.goto("/#chat");
  const composer = page.getByRole("textbox", { name: "Message" });
  await page.getByRole("checkbox", { name: "Simulate send failure" }).check();
  await composer.fill("Keep this message");
  await composer.press("Enter");
  await expect(page.getByText("Could not send. Try again.")).toBeVisible();
  await expect(composer).toHaveValue("Keep this message");
  await page.getByRole("checkbox", { name: "Simulate send failure" }).uncheck();
  await composer.press("Enter");
  await composer.fill("Next draft");
  await expect(
    page
      .getByRole("region", { name: "Conversation messages", exact: true })
      .getByText("This is a local demo response.", { exact: false })
      .last(),
  ).toBeVisible();
  await expect(composer).toHaveValue("Next draft");
});

test("Flow choices are keyboard buttons and change the host selection", async ({
  page,
}) => {
  await page.goto("/#flow");
  const choice = page.getByRole("button", { name: /01 Design/ });
  await choice.focus();
  await choice.press("Enter");
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("flow-choice")).toHaveText("Design");
});

test("mobile navigation and chat fit without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "AI Chat", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Send", exact: true }),
  ).toBeVisible();
});

test("authority change isolates a pending message from the replacement conversation", async ({
  page,
}) => {
  await page.goto("/#chat");
  const composer = page.getByRole("textbox", { name: "Message" });
  await composer.fill("Old conversation");
  await composer.press("Enter");
  await expect(page.locator("form[aria-busy=true]")).toHaveCount(1);
  await page
    .getByRole("button", { name: "New conversation", exact: true })
    .click();
  await composer.fill("New draft");
  await page.waitForTimeout(700); // The demo host's old 550ms request must finish.
  await expect(composer).toHaveValue("New draft");
  await expect(
    page
      .getByRole("region", { name: "Conversation messages", exact: true })
      .getByText("Old conversation", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Send", exact: true }),
  ).toBeEnabled();
});

test("responsive panel preserves the focused editor and returns focus on close", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/#chat");
  const opener = page.getByRole("button", { name: "Open side panel ↗" });
  await opener.click();
  const editor = page.getByRole("textbox", { name: "Message" });
  await editor.fill("Draft across screens");
  await editor.evaluate((element) =>
    element.setAttribute("data-editor-identity", "original"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(editor).toHaveValue("Draft across screens");
  await expect(editor).toHaveAttribute("data-editor-identity", "original");
  await expect(editor).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Send", exact: true }),
  ).toBeInViewport();
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(
    page.getByRole("region", { name: "Assistant panel", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(editor).toBeFocused();
  await page
    .getByRole("region", { name: "Assistant panel", exact: true })
    .getByRole("button", { name: "Close conversation panel" })
    .click();
  await expect(opener).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue(
    "Draft across screens",
  );
});

test("conversation text is escaped and search opens its matching demo", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Search components" })
    .fill("slider");
  await page
    .getByRole("button", { name: /Controls/ })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Selection and range" }),
  ).toBeVisible();
  await page.goto("/#chat");
  const text = '<img src=x onerror="window.__romInjected=true">';
  await page.getByRole("textbox", { name: "Message" }).fill(text);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Conversation messages", exact: true })
      .getByText(text, { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => Object.hasOwn(window, "__romInjected")),
  ).toBe(false);
});

test("inactive Flow fitting does not reset a manually zoomed viewport", async ({
  page,
}) => {
  await page.goto("/#flow");
  const viewport = page.locator(".svelte-flow__viewport");
  await page.getByRole("checkbox", { name: "Automatic fitting" }).uncheck();
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await page.waitForTimeout(400); // Svelte Flow animates its zoom control for 300ms.
  const transform = await viewport.getAttribute("style");
  await page.getByRole("button", { name: "Fit view", exact: true }).click();
  await page.waitForTimeout(100); // Two canceled animation frames must not fit.
  await expect(viewport).toHaveAttribute("style", transform!);
  await page.getByRole("checkbox", { name: "Automatic fitting" }).check();
  await expect(viewport).not.toHaveAttribute("style", transform!);
});

test("ROM focus correction moves a hidden expansion control to its frame", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/#chat");
  const expansion = page.getByRole("button", { name: "Expand", exact: true });
  await expansion.focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(expansion).toBeHidden();
  await expect(
    page.getByRole("region", { name: "Example conversation", exact: true }),
  ).toBeFocused();
});

test("ROM focus correction does not reclaim focus after deliberate blur", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/#chat");
  const expansion = page.getByRole("button", { name: "Expand", exact: true });
  await expansion.focus();
  await expansion.evaluate((element) => (element as HTMLElement).blur());
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(expansion).toBeHidden();
  expect(
    await page.evaluate(() => document.activeElement === document.body),
  ).toBe(true);
});

test("long messages scroll inside the conversation with a visible mobile composer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/#chat");
  await page
    .getByRole("textbox", { name: "Message" })
    .fill("Example paragraph.\n".repeat(120));
  await page.getByRole("button", { name: "Send", exact: true }).click();
  const body = page.getByRole("region", {
    name: "Conversation messages",
    exact: true,
  });
  await expect(
    body.getByText("This is a local demo response.", { exact: false }),
  ).toBeVisible();
  expect(
    await body.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await expect(page.getByRole("textbox", { name: "Message" })).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Send", exact: true }),
  ).toBeInViewport();
});

test("one composer retains pending ownership when moved into the panel", async ({
  page,
}) => {
  await page.goto("/#chat");
  const editor = page.getByRole("textbox", { name: "Message" });
  await editor.fill("One send");
  await editor.evaluate((element) =>
    element.setAttribute("data-editor-witness", "single"),
  );
  await editor.press("Enter");
  await page.getByRole("button", { name: "Open side panel ↗" }).click();
  await expect(
    page.getByRole("button", { name: "Send", exact: true }),
  ).toBeDisabled();
  await expect(editor).toHaveAttribute("data-editor-witness", "single");
  await expect(
    page
      .getByRole("region", { name: "Conversation messages", exact: true })
      .getByText("One send", { exact: true }),
  ).toHaveCount(1);
});

test("skip link preserves the current demo and focuses main", async ({
  page,
}) => {
  await page.goto("/#chat");
  await page.getByRole("textbox", { name: "Message" }).fill("Draft");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#chat$/);
  await expect(page.locator("main")).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue(
    "Draft",
  );
});

test("collapsed mobile navigation does not receive keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.focus();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest(".sidebar")),
  ).toBe(false);
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`Flow auto fit animates according to ${reducedMotion}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/#flow");
    await page.getByRole("button", { name: "Zoom In", exact: true }).waitFor();
    await page.waitForTimeout(500); // Allow the initial fit to settle before manually zooming.
    await page.getByRole("button", { name: "Zoom In", exact: true }).click();
    await page.waitForTimeout(400); // Svelte Flow's zoom control animates for 300ms.
    const transforms = await page.evaluate(async () => {
      const viewport = document.querySelector<HTMLElement>(
        ".svelte-flow__viewport",
      )!;
      const seen = new Set<string>([viewport.style.transform]);
      const start = performance.now();
      [...document.querySelectorAll<HTMLButtonElement>("button")]
        .find((button) => button.textContent?.trim() === "Fit view")!
        .click();
      await new Promise<void>((resolve) => {
        function sample() {
          seen.add(viewport.style.transform);
          if (performance.now() - start < 600) requestAnimationFrame(sample);
          else resolve();
        }
        requestAnimationFrame(sample);
      });
      return [...seen];
    });
    if (reducedMotion === "reduce")
      expect(transforms.length).toBeLessThanOrEqual(2);
    else expect(transforms.length).toBeGreaterThan(4);
  });
}

test("composer extensions are interactive without submitting the draft", async ({
  page,
}) => {
  await page.goto("/#chat");
  const draft = page.getByRole("textbox", { name: "Message", exact: true });
  await draft.fill("Keep this draft");
  await page
    .getByRole("button", { name: "Microphone extension", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Microphone extension", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(draft).toHaveValue("Keep this draft");
  await expect(page.getByText("Keep this draft", { exact: true })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "More message actions", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Insert resource reference", exact: true })
    .click();
  await expect(draft).toHaveValue("Keep this draft resource/a");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Microphone extension", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("Keep this draft resource/a", { exact: true }),
  ).toBeVisible();
});

test("agent activity details and application actions are interactive", async ({
  page,
}) => {
  await page.goto("/#chat");
  const activity = page.getByRole("region", {
    name: "Agent activity",
    exact: true,
  });
  await expect(activity).toBeVisible();
  await activity
    .locator("summary")
    .filter({ hasText: "Inspect resource" })
    .click();
  await expect(
    activity.getByText("Read the authorized resource projection.", {
      exact: true,
    }),
  ).toBeVisible();
  await activity
    .getByRole("button", { name: "Run example task", exact: true })
    .click();
  await expect(activity.getByRole("status")).toContainText("Running");
  await activity
    .getByRole("button", { name: "Cancel example task", exact: true })
    .click();
  await expect(activity.getByRole("status")).toContainText("Canceled");
  await page.waitForTimeout(1000); // Canceled work must not publish its later completion.
  await expect(activity.getByRole("status")).toContainText("Canceled");
});

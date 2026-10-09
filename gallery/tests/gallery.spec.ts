import { test, expect } from "@playwright/test";

test("gallery navigation, theme and controls are usable", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Komponenty, które pasują do Twojej aplikacji.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zmień motyw" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Podstawy", exact: true }).click();
  await page.getByLabel("Nazwa projektu").fill("Mój projekt");
  await expect(page.getByTestId("control-value")).toHaveText("Mój projekt");
});

test("chat submits text, preserves Shift+Enter and ignores IME Enter", async ({
  page,
}) => {
  await page.goto("/#chat");
  const composer = page.getByRole("textbox", { name: "Wiadomość" });
  await composer.fill("Cześć");
  await composer.press("Shift+Enter");
  await expect(composer).toHaveValue("Cześć\n");
  await composer.dispatchEvent("compositionstart");
  await composer.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(composer).toHaveValue("Cześć\n");
  await expect(
    page
      .getByRole("region", { name: "Wiadomości rozmowy", exact: true })
      .getByText("Cześć", { exact: true }),
  ).toHaveCount(0);
  await composer.dispatchEvent("compositionend");
  await composer.press("Enter");
  await expect(
    page
      .getByRole("region", { name: "Wiadomości rozmowy", exact: true })
      .getByText("Cześć", { exact: true }),
  ).toBeVisible();
  await expect(composer).toHaveValue("");
  await expect(
    page
      .getByRole("region", { name: "Wiadomości rozmowy", exact: true })
      .getByText("To lokalna odpowiedź demonstracyjna.", { exact: false })
      .last(),
  ).toBeVisible();
});

test("chat failures retain drafts, pending completion does not erase a changed draft", async ({
  page,
}) => {
  await page.goto("/#chat");
  const composer = page.getByRole("textbox", { name: "Wiadomość" });
  await page.getByRole("checkbox", { name: "Symuluj błąd wysyłania" }).check();
  await composer.fill("Zachowaj tę wiadomość");
  await composer.press("Enter");
  await expect(
    page.getByText("Nie udało się wysłać. Spróbuj ponownie."),
  ).toBeVisible();
  await expect(composer).toHaveValue("Zachowaj tę wiadomość");
  await page
    .getByRole("checkbox", { name: "Symuluj błąd wysyłania" })
    .uncheck();
  await composer.press("Enter");
  await composer.fill("Kolejny szkic");
  await expect(
    page
      .getByRole("region", { name: "Wiadomości rozmowy", exact: true })
      .getByText("To lokalna odpowiedź demonstracyjna.", { exact: false })
      .last(),
  ).toBeVisible();
  await expect(composer).toHaveValue("Kolejny szkic");
});

test("Flow choices are keyboard buttons and change the host selection", async ({
  page,
}) => {
  await page.goto("/#flow");
  const choice = page.getByRole("button", { name: /01 Projektuj/ });
  await choice.focus();
  await choice.press("Enter");
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("flow-choice")).toHaveText("Projektuj");
});

test("mobile navigation and chat fit without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Otwórz nawigację" }).click();
  await page.getByRole("button", { name: "Czat AI", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Wiadomość" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Wyślij", exact: true }),
  ).toBeVisible();
});

test("authority change isolates a pending message from the replacement conversation", async ({
  page,
}) => {
  await page.goto("/#chat");
  const composer = page.getByRole("textbox", { name: "Wiadomość" });
  await composer.fill("Stara rozmowa");
  await composer.press("Enter");
  await expect(page.locator("form[aria-busy=true]")).toHaveCount(1);
  await page.getByRole("button", { name: "Nowa rozmowa", exact: true }).click();
  await composer.fill("Nowy szkic");
  await page.waitForTimeout(700); // The demo host's old 550ms request must finish.
  await expect(composer).toHaveValue("Nowy szkic");
  await expect(
    page
      .getByRole("region", { name: "Wiadomości rozmowy", exact: true })
      .getByText("Stara rozmowa", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Wyślij", exact: true }),
  ).toBeEnabled();
});

test("responsive panel preserves the focused editor and returns focus on close", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/#chat");
  const opener = page.getByRole("button", { name: "Otwórz panel boczny ↗" });
  await opener.click();
  const editor = page.getByRole("textbox", { name: "Wiadomość" });
  await editor.fill("Szkic między ekranami");
  await editor.evaluate((element) =>
    element.setAttribute("data-editor-identity", "original"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(editor).toHaveValue("Szkic między ekranami");
  await expect(editor).toHaveAttribute("data-editor-identity", "original");
  await expect(editor).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Wyślij", exact: true }),
  ).toBeInViewport();
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(
    page.getByRole("region", { name: "Asystent w panelu", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(editor).toBeFocused();
  await page
    .getByRole("region", { name: "Asystent w panelu", exact: true })
    .getByRole("button", { name: "Zamknij panel rozmowy" })
    .click();
  await expect(opener).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Wiadomość" })).toHaveValue(
    "Szkic między ekranami",
  );
});

test("conversation text is escaped and search opens its matching demo", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Szukaj komponentów" })
    .fill("slider");
  await page
    .getByRole("button", { name: /Podstawy/ })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Wybór i zakres" }),
  ).toBeVisible();
  await page.goto("/#chat");
  const text = '<img src=x onerror="window.__romInjected=true">';
  await page.getByRole("textbox", { name: "Wiadomość" }).fill(text);
  await page.getByRole("button", { name: "Wyślij", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Wiadomości rozmowy", exact: true })
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
  await page
    .getByRole("checkbox", { name: "Automatyczne dopasowanie" })
    .uncheck();
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await page.waitForTimeout(400); // Svelte Flow animates its zoom control for 300ms.
  const transform = await viewport.getAttribute("style");
  await page
    .getByRole("button", { name: "Dopasuj widok", exact: true })
    .click();
  await page.waitForTimeout(100); // Two canceled animation frames must not fit.
  await expect(viewport).toHaveAttribute("style", transform!);
  await page
    .getByRole("checkbox", { name: "Automatyczne dopasowanie" })
    .check();
  await expect(viewport).not.toHaveAttribute("style", transform!);
});

test("ROM focus correction moves a hidden expansion control to its frame", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/#chat");
  const expansion = page.getByRole("button", { name: "Rozwiń", exact: true });
  await expansion.focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(expansion).toBeHidden();
  await expect(
    page.getByRole("region", { name: "Przykład rozmowy", exact: true }),
  ).toBeFocused();
});

test("ROM focus correction does not reclaim focus after deliberate blur", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/#chat");
  const expansion = page.getByRole("button", { name: "Rozwiń", exact: true });
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
    .getByRole("textbox", { name: "Wiadomość" })
    .fill("Przykładowy akapit.\n".repeat(120));
  await page.getByRole("button", { name: "Wyślij", exact: true }).click();
  const body = page.getByRole("region", {
    name: "Wiadomości rozmowy",
    exact: true,
  });
  await expect(
    body.getByText("To lokalna odpowiedź demonstracyjna.", { exact: false }),
  ).toBeVisible();
  expect(
    await body.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("textbox", { name: "Wiadomość" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Wyślij", exact: true }),
  ).toBeInViewport();
});

test("one composer retains pending ownership when moved into the panel", async ({
  page,
}) => {
  await page.goto("/#chat");
  const editor = page.getByRole("textbox", { name: "Wiadomość" });
  await editor.fill("Jedno wysłanie");
  await editor.evaluate((element) =>
    element.setAttribute("data-editor-witness", "single"),
  );
  await editor.press("Enter");
  await page.getByRole("button", { name: "Otwórz panel boczny ↗" }).click();
  await expect(
    page.getByRole("button", { name: "Wyślij", exact: true }),
  ).toBeDisabled();
  await expect(editor).toHaveAttribute("data-editor-witness", "single");
  await expect(
    page
      .getByRole("region", { name: "Wiadomości rozmowy", exact: true })
      .getByText("Jedno wysłanie", { exact: true }),
  ).toHaveCount(1);
});

test("skip link preserves the current demo and focuses main", async ({
  page,
}) => {
  await page.goto("/#chat");
  await page.getByRole("textbox", { name: "Wiadomość" }).fill("Szkic");
  const skip = page.getByRole("link", { name: "Przejdź do treści" });
  await skip.focus();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#chat$/);
  await expect(page.locator("main")).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Wiadomość" })).toHaveValue(
    "Szkic",
  );
});

test("collapsed mobile navigation does not receive keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Otwórz nawigację" });
  await toggle.focus();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest(".sidebar")),
  ).toBe(false);
});

import { test, expect } from "@playwright/test";
for (const kind of ["hidden-target", "external-departure", "body-departure", "late-target", "rapid-reversal", "disabled", "inert", "detached", "destroyed"]) {
  test(`one-transition focus intent: ${kind}`, async ({ page }) => {
    await page.goto("focus-boundary.html");
    const result = await page.evaluate(async kind => {
      const run = Reflect.get(window, "runFocusBoundary");
      if (typeof run !== "function") throw Error("Boundary fixture unavailable");
      return await run(kind);
    }, kind);
    expect(result.focused).toBe(kind === "hidden-target" || kind === "rapid-reversal");
    if (kind === "external-departure") expect(result.outside).toBe(true);
    if (kind === "body-departure") expect(result.body).toBe(true);
    expect(result.value).toBe("Raw unchanged draft");
    if (kind !== "detached") expect(result.same_node).toBe(true);
    expect(result.selection).toEqual([2, 9, "backward"]);
    if (kind === "rapid-reversal") expect(result.in_source).toBe(true);
    if (kind === "destroyed" || kind === "late-target") expect(result.remounted_focus).toBe(false);
  });
}

test("rapid native breakpoint reversal retains one editor and its selection", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("details.html");
  await page.getByRole("button", { name: "Open inspection details", exact: true }).click();
  const draft = page.getByRole("textbox", { name: "Inspection draft", exact: true });
  await draft.fill("Unchanged composition");await draft.focus();await draft.evaluate((element: HTMLTextAreaElement) => {element.dataset.witness = "original";element.setSelectionRange(2, 9, "backward");});
  for (const width of [390, 1440, 390, 1440]) await page.setViewportSize({ width, height: 844 });
  await expect(draft).toBeFocused();await expect(draft).toHaveAttribute("data-witness", "original");await expect(draft).toHaveValue("Unchanged composition");
  expect(await draft.evaluate((element: HTMLTextAreaElement) => [element.selectionStart, element.selectionEnd, element.selectionDirection])).toEqual([2, 9, "backward"]);
});

for (const close of ["Escape", "close button"]) {
test(`${close} while crossing closes details without restoring a stale editor`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });await page.goto("details.html");
  const opener = page.getByRole("button", { name: "Open inspection details", exact: true });await opener.click();
  const draft = page.getByRole("textbox", { name: "Inspection draft", exact: true });await draft.focus();
  await page.setViewportSize({ width: 390, height: 844 });await expect(page.getByRole("dialog", { name: "Inspection details", exact: true })).toBeVisible();if (close === "Escape") await page.keyboard.press("Escape");
  else await page.getByRole("button", { name: "Close inspection details", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();await expect(opener).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });await expect(opener).toBeFocused();expect(await page.evaluate(() => document.activeElement?.tagName === "TEXTAREA")).toBe(false);
});

}

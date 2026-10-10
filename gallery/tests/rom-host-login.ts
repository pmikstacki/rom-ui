import { expect, type Page } from "@playwright/test";

export async function loginGallery(target: Page, base: URL, account: string) {
  await target.goto(`${base.href}#rom`);
  await target.getByRole("link", { name: "Sign in with Gallery account", exact: true }).click();
  await target.getByLabel("Fixture account", { exact: true }).selectOption(account);
  await target.getByRole("button", { name: "Sign in", exact: true }).click();
  await target.getByRole("button", { name: "Allow", exact: true }).click();
  await expect(target).toHaveURL(base.href);
  await target.goto(`${base.href}#rom`);
}

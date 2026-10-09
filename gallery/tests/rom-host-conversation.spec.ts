import { test, expect } from "@playwright/test";
import { loginGallery } from "./rom-host-login";

test("ROM conversation persists messages and retries a lost acknowledgement exactly once", async ({ page }) => {
  const host = process.env.ROM_GALLERY_HOST_URL;
  test.skip(!host, "Requires the local ROM host and synthetic OIDC provider.");
  const base = new URL(host!);
  expect(base.hostname).toBe("127.0.0.1");
  await loginGallery(page, base, "alice");
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-conversations");
  await expect(page.getByRole("button", { name: "bob-chat", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "alice-chat", exact: true }).click();
  const conversation = page.getByRole("region", { name: "ROM conversation", exact: true });
  const draft = conversation.getByLabel("ROM message", { exact: true });
  const content = `ROM message ${Date.now()}`;
  await draft.fill(content);
  await conversation.getByRole("button", { name: "Conversation details", exact: true }).click();
  await expect(draft).toHaveValue(content);
  const commands: string[] = [];
  let releaseRetry!: () => void;
  const retryGate = new Promise<void>(resolve => { releaseRetry = resolve; });
  await page.route("**/api/invoke", async route => {
    commands.push(route.request().postData()!);
    if (commands.length <= 2) {
      const response = await route.fetch();
      expect(response.status()).toBe(200);
      await response.body();
      await route.abort("failed");
    } else {
      await retryGate;
      await route.continue();
    }
  });
  await conversation.getByRole("button", { name: "Send to ROM", exact: true }).click();
  await expect(draft).toHaveValue(content);
  const retry = page.getByRole("button", { name: "Retry saved mutation", exact: true });
  await expect(retry).toBeVisible();
  await expect(conversation.getByRole("button", { name: "Send to ROM", exact: true })).toBeDisabled();
  await retry.click();
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  expect(commands).toHaveLength(2);
  await expect(retry).toBeVisible();
  await expect(draft).toHaveValue(content);
  await expect(conversation.getByRole("button", { name: "Send to ROM", exact: true })).toBeDisabled();
  await retry.click();
  await expect.poll(() => commands.length).toBe(3);
  await expect(page.getByRole("button", { name: "Restore saved draft and mutation", exact: true })).toBeDisabled();
  await expect(page.getByTestId("rom-update-pending")).toBeVisible();
  releaseRetry();
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  expect(commands).toHaveLength(3);
  expect(commands[1]).toBe(commands[0]);
  expect(commands[2]).toBe(commands[0]);
  await expect(page.getByTestId("rom-conversation-messages").getByText(content, { exact: true })).toHaveCount(1);
  await expect(draft).toHaveValue("");
  await expect(conversation.getByText("Message was not confirmed. Your text is preserved; restore and retry any saved mutation before sending again.", { exact: true })).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-conversations");
  await page.getByRole("button", { name: "alice-chat", exact: true }).click();
  await expect(page.getByTestId("rom-conversation-messages").getByText(content, { exact: true })).toHaveCount(1);
  await expect(retry).toHaveCount(0);
  await page.unroute("**/api/invoke");
  const confirmed = `${content} confirmed`;
  await draft.fill(confirmed);
  await conversation.getByRole("button", { name: "Send to ROM", exact: true }).click();
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await expect(draft).toHaveValue("");
  await expect(page.getByTestId("rom-conversation-messages").getByText(confirmed, { exact: true })).toHaveCount(1);
});

import { test, expect } from "@playwright/test";
import { loginGallery } from "./rom-host-login";

const host = process.env.ROM_GALLERY_HOST_URL;
test("ROM workflow nodes persist selection and observe another tab", async ({ page, context }) => {
  test.skip(!host, "Requires the local ROM host and synthetic OIDC provider.");
  const base = new URL(host!);
  expect(base.hostname).toBe("127.0.0.1");
  expect(base.protocol).toBe("http:");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await loginGallery(page, base, "alice");
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-workflows");
  await expect(page.getByRole("button", { name: "bob-workflow", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "alice-workflow", exact: true }).click();
  const workflow = page.getByRole("region", { name: "ROM workflow", exact: true });
  const selected = page.getByTestId("rom-workflow-selection");
  await expect(workflow).toBeVisible();
  const next = await selected.textContent() === "build" ? "share" : "build";
  await workflow.getByRole("button", { name: new RegExp(next === "build" ? "Build$" : "Share$") }).click();
  await expect(selected).toHaveText(next);
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-workflows");
  await page.getByRole("button", { name: "alice-workflow", exact: true }).click();
  await expect(selected).toHaveText(next);
  await workflow.getByRole("button", { name: /Design$/ }).click();
  await expect(selected).toHaveText("design");
  await expect(page.getByTestId("rom-update-pending")).toHaveCount(0);
  await page.getByRole("button", { name: "Start live workflow updates", exact: true }).click();
  const other = await context.newPage();
  other.on("pageerror", error => errors.push(error.message));
  try {
    await other.goto(`${base.href}#rom`);
    await other.getByLabel("Resource kind", { exact: true }).selectOption("gallery-workflows");
    await other.getByRole("button", { name: "alice-workflow", exact: true }).click();
    await other.getByRole("region", { name: "ROM workflow", exact: true }).getByRole("button", { name: /Share$/ }).click();
    await expect(other.getByTestId("rom-workflow-selection")).toHaveText("share");
    await expect(other.getByTestId("rom-update-pending")).toHaveCount(0);
    await expect(selected).toHaveText("share");
  } finally { await other.close(); }
  await page.getByRole("button", { name: "Stop live workflow updates", exact: true }).click();
  // Withhold one capability from actual discovery; keep resource values unchanged.
  await page.route("**/api/discover", async route => {
    const response = await route.fetch();
    const discovery = await response.json();
    const descriptor = discovery.resources.find((item: { kind: string }) => item.kind === "gallery-workflows");
    descriptor.actions = [];
    descriptor.action_inputs = [];
    await route.fulfill({ response, json: discovery });
  });
  await page.reload();
  await page.getByLabel("Resource kind", { exact: true }).selectOption("gallery-workflows");
  await page.getByRole("button", { name: "alice-workflow", exact: true }).click();
  await expect(selected).toHaveText("share");
  await expect(workflow.getByText("Selection is read-only for this view.", { exact: true })).toBeVisible();
  for (const label of ["Design", "Build", "Share"]) {
    await expect(workflow.getByRole("button", { name: new RegExp(label + "$" ) })).toBeDisabled();
  }
  expect(errors).toEqual([]);
});

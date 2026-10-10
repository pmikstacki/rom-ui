import { test, expect } from "@playwright/test";
for (const transition of ["Deactivate fitting", "Unmount fitting"]) {
  test(`empty graph fit does not leak across ${transition}`, async ({
    page,
  }) => {
    await page.goto("/flow-lifetime.html");
    const viewport = page.locator(".svelte-flow__viewport");
    await expect(viewport).toBeVisible();
    await page.waitForTimeout(150); // Allow the initial double RAF to hand off its request.
    const before = await viewport.getAttribute("style");
    await page.getByRole("button", { name: transition, exact: true }).click();
    await page
      .getByRole("button", { name: "Load replacement graph", exact: true })
      .click();
    await expect(
      page.getByText("Replacement node", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(150); // Replacement nodes must initialize without replaying an old fit.
    await expect(viewport).toHaveAttribute("style", before!);
  });
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`auto fitting respects ${reducedMotion} motion preference`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/flow-lifetime.html");
    await page.locator(".svelte-flow__viewport").waitFor();
    const styles = await page.evaluate(async () => {
      const viewport = document.querySelector<HTMLElement>(
        ".svelte-flow__viewport",
      )!;
      const seen = new Set<string>();
      const start = performance.now();
      document.querySelector<HTMLButtonElement>("[data-load-graph]")!.click();
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
      expect(styles.length).toBeLessThanOrEqual(2);
    else expect(styles.length).toBeGreaterThan(4);
  });
}

for (const transition of ["Deactivate fitting", "Unmount fitting"]) {
  test(`in-progress animated fitting stops on ${transition}`, async ({
    page,
  }) => {
    await page.goto("/flow-lifetime.html");
    const viewport = page.locator(".svelte-flow__viewport");
    await viewport.waitFor();
    const initial = await viewport.getAttribute("style");
    await page
      .getByRole("button", { name: "Load wide graph", exact: true })
      .click();
    await expect.poll(() => viewport.getAttribute("style")).not.toBe(initial);
    await page.getByRole("button", { name: transition, exact: true }).click();
    const stopped = await viewport.getAttribute("style");
    await page.waitForTimeout(400); // Outlast the default animation after its owner is removed.
    await expect(viewport).toHaveAttribute("style", stopped!);
  });
}

for (const transition of ["Deactivate fitting", "Unmount fitting"]) {
  test(`stopped animation does not replay after replacement on ${transition}`, async ({
    page,
  }) => {
    await page.goto("/flow-lifetime.html");
    const viewport = page.locator(".svelte-flow__viewport");
    await viewport.waitFor();
    const initial = await viewport.getAttribute("style");
    await page
      .getByRole("button", { name: "Load wide graph", exact: true })
      .click();
    await expect.poll(() => viewport.getAttribute("style")).not.toBe(initial);
    await page.getByRole("button", { name: transition, exact: true }).click();
    const stopped = await viewport.getAttribute("style");
    await page
      .getByRole("button", { name: "Load replacement graph", exact: true })
      .click();
    await page.waitForTimeout(600); // A stale upstream fit must not restart on replacement node initialization.
    await expect(viewport).toHaveAttribute("style", stopped!);
  });
}

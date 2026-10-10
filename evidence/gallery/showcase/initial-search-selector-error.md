# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: showcase.spec.ts >> catalog keeps overview, search and keyboard navigation aligned
- Location: tests/showcase.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('textbox', { name: 'Search components' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Skip to content" [ref=e3] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - link "ROM UI — overview" [ref=e6] [cursor=pointer]:
        - /url: "#overview"
        - generic [aria-hidden] [ref=e7]: r.
        - generic [ref=e8]: ROM/ UI
        - generic [ref=e9]: alpha
      - generic [ref=e10]: COMPONENT LIBRARY
      - navigation "Component gallery" [ref=e11]:
        - button "Overview" [ref=e12] [cursor=pointer]:
          - generic [aria-hidden] [ref=e13]: ◈
          - generic [aria-hidden] [ref=e15]: "09"
        - button "Controls" [ref=e16] [cursor=pointer]:
          - generic [aria-hidden] [ref=e17]: ⊞
          - generic [aria-hidden] [ref=e19]: "11"
        - button "Compositions" [ref=e20] [cursor=pointer]:
          - generic [aria-hidden] [ref=e21]: ▥
          - generic [aria-hidden] [ref=e23]: "06"
        - button "AI Chat" [ref=e24] [cursor=pointer]:
          - generic [aria-hidden] [ref=e25]: ✳
          - generic [aria-hidden] [ref=e27]: "04"
        - button "Flow" [ref=e28] [cursor=pointer]:
          - generic [aria-hidden] [ref=e29]: ⌘
          - generic [aria-hidden] [ref=e31]: "02"
        - button "Dialogs & feedback" [ref=e32] [cursor=pointer]:
          - generic [aria-hidden] [ref=e33]: ▢
          - generic [aria-hidden] [ref=e35]: "04"
        - button "Forms" [ref=e36] [cursor=pointer]:
          - generic [aria-hidden] [ref=e37]: ▦
          - generic [aria-hidden] [ref=e39]: "18"
        - button "Studio primitives" [ref=e40] [cursor=pointer]:
          - generic [aria-hidden] [ref=e41]: ▤
          - generic [aria-hidden] [ref=e43]: "14"
        - button "Maps" [ref=e44] [cursor=pointer]:
          - generic [aria-hidden] [ref=e45]: ◎
          - generic [aria-hidden] [ref=e47]: "16"
        - button "Flex" [ref=e48] [cursor=pointer]:
          - generic [aria-hidden] [ref=e49]: ⇄
          - generic [aria-hidden] [ref=e51]: "02"
      - generic [ref=e52]: Extracted from real applications.
      - generic [ref=e54]:
        - link "Repository" [ref=e55] [cursor=pointer]:
          - /url: https://github.com/pmikstacki/rom-ui
          - text: Repository
          - generic [aria-hidden] [ref=e56]: ↗
        - generic [ref=e57]: Svelte 5 · pnpm
    - generic [ref=e58]:
      - banner [ref=e59]:
        - generic [ref=e60]:
          - text: Gallery
          - generic [ref=e61]: /
          - strong [ref=e62]: Overview
        - generic [ref=e63]:
          - searchbox "Search components" [ref=e68]
          - button "Toggle theme" [ref=e69] [cursor=pointer]: ◐
      - main [ref=e70]:
        - region "Gallery view" [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e73]:
              - generic [ref=e74]: ROM UI · 0.1.0-alpha.7
              - heading "Components that fit your application." [level=1] [ref=e76]
              - paragraph [ref=e77]: From a single field to a complete conversation. A set of Svelte controls, extracted from ROM Studio and developed in real applications.
              - generic [ref=e78]:
                - button "Explore components" [ref=e79] [cursor=pointer]:
                  - text: Explore components
                  - generic [aria-hidden] [ref=e80]: ↗
                - link "View source" [ref=e81] [cursor=pointer]:
                  - /url: https://github.com/pmikstacki/rom-ui
                  - text: View source ↗
            - generic [aria-hidden] [ref=e82]:
              - generic [ref=e86]: ⊞
              - generic [ref=e87]: ✳
              - generic [ref=e88]: ⌘
              - generic [ref=e89]:
                - text: r
                - generic [ref=e90]: .
              - generic [ref=e91]: COMPOSE YOUR INTERFACE
          - generic [ref=e92]:
            - generic [ref=e93]:
              - text: COMPONENT FAMILIES
              - heading "Try it yourself" [level=2] [ref=e94]
            - generic [ref=e95]: Live examples, your own data
          - generic [ref=e96]:
            - button "11 / components Controls Small controls. Consistent behavior. Open examples" [ref=e97] [cursor=pointer]:
              - generic [aria-hidden] [ref=e98]: ⊞
              - generic [ref=e99]: 11 / components
              - heading "Controls" [level=2] [ref=e100]
              - paragraph [ref=e101]: Small controls. Consistent behavior.
              - generic [ref=e102]:
                - text: Open examples
                - generic [aria-hidden] [ref=e103]: ↗
            - button "06 / components Compositions Larger elements that combine controls. Open examples" [ref=e104] [cursor=pointer]:
              - generic [aria-hidden] [ref=e105]: ▥
              - generic [ref=e106]: 06 / components
              - heading "Compositions" [level=2] [ref=e107]
              - paragraph [ref=e108]: Larger elements that combine controls.
              - generic [ref=e109]:
                - text: Open examples
                - generic [aria-hidden] [ref=e110]: ↗
            - button "04 / components AI Chat A space to chat with any model. Open examples" [ref=e111] [cursor=pointer]:
              - generic [aria-hidden] [ref=e112]: ✳
              - generic [ref=e113]: 04 / components
              - heading "AI Chat" [level=2] [ref=e114]
              - paragraph [ref=e115]: A space to chat with any model.
              - generic [ref=e116]:
                - text: Open examples
                - generic [aria-hidden] [ref=e117]: ↗
            - button "02 / components Flow Interactive paths with Svelte Flow. Open examples" [ref=e118] [cursor=pointer]:
              - generic [aria-hidden] [ref=e119]: ⌘
              - generic [ref=e120]: 02 / components
              - heading "Flow" [level=2] [ref=e121]
              - paragraph [ref=e122]: Interactive paths with Svelte Flow.
              - generic [ref=e123]:
                - text: Open examples
                - generic [aria-hidden] [ref=e124]: ↗
            - button "04 / components Dialogs & feedback Dialogs, panels, popovers and inline notifications. Open examples" [ref=e125] [cursor=pointer]:
              - generic [aria-hidden] [ref=e126]: ▢
              - generic [ref=e127]: 04 / components
              - heading "Dialogs & feedback" [level=2] [ref=e128]
              - paragraph [ref=e129]: Dialogs, panels, popovers and inline notifications.
              - generic [ref=e130]:
                - text: Open examples
                - generic [aria-hidden] [ref=e131]: ↗
            - button "18 / components Forms Descriptor-driven fields from ROM Studio. Open examples" [ref=e132] [cursor=pointer]:
              - generic [aria-hidden] [ref=e133]: ▦
              - generic [ref=e134]: 18 / components
              - heading "Forms" [level=2] [ref=e135]
              - paragraph [ref=e136]: Descriptor-driven fields from ROM Studio.
              - generic [ref=e137]:
                - text: Open examples
                - generic [aria-hidden] [ref=e138]: ↗
            - button "14 / components Studio primitives Shared building blocks used by ROM Studio. Open examples" [ref=e139] [cursor=pointer]:
              - generic [aria-hidden] [ref=e140]: ▤
              - generic [ref=e141]: 14 / components
              - heading "Studio primitives" [level=2] [ref=e142]
              - paragraph [ref=e143]: Shared building blocks used by ROM Studio.
              - generic [ref=e144]:
                - text: Open examples
                - generic [aria-hidden] [ref=e145]: ↗
            - button "16 / components Maps Resources and layers on MapLibre maps. Open examples" [ref=e146] [cursor=pointer]:
              - generic [aria-hidden] [ref=e147]: ◎
              - generic [ref=e148]: 16 / components
              - heading "Maps" [level=2] [ref=e149]
              - paragraph [ref=e150]: Resources and layers on MapLibre maps.
              - generic [ref=e151]:
                - text: Open examples
                - generic [aria-hidden] [ref=e152]: ↗
            - button "02 / components Flex View transitions with Animotion and the View Transitions API. Open examples" [ref=e153] [cursor=pointer]:
              - generic [aria-hidden] [ref=e154]: ⇄
              - generic [ref=e155]: 02 / components
              - heading "Flex" [level=2] [ref=e156]
              - paragraph [ref=e157]: View transitions with Animotion and the View Transitions API.
              - generic [ref=e158]:
                - text: Open examples
                - generic [aria-hidden] [ref=e159]: ↗
          - generic [ref=e160]:
            - generic [ref=e161]:
              - text: YOUR HOST, YOUR RULES
              - heading "Presentation is shared. Logic belongs to your application." [level=2] [ref=e162]: Presentation is shared.Logic belongs to your application.
            - paragraph [ref=e163]: Controls accept values and events. Compositions arrange the interface. The AI model, history, permissions, and data storage remain where you define them.
            - generic [ref=e164]:
              - generic [ref=e165]: Public API
              - generic [ref=e166]: Installed package
              - generic [ref=e167]: Optional Flow
        - generic [ref=e168]:
          - generic [ref=e169]: ROM UI · Component gallery
          - generic [ref=e170]:
            - text: MIT · 0.1.0-alpha.7 ·
            - link "Licenses" [ref=e171] [cursor=pointer]:
              - /url: /licenses.txt
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("catalog keeps overview, search and keyboard navigation aligned", async ({ page }) => {
  4  |   await page.goto("/");
  5  |   const cards = page.locator(".category-card");
  6  |   const families = page.getByRole("navigation", { name: "Component gallery" }).getByRole("button");
  7  |   await expect(cards).toHaveCount((await families.count()) - 1);
  8  |   await expect(families.first().locator(".nav-count")).toHaveText("09");
> 9  |   await page.getByRole("textbox", { name: "Search components" }).fill("semantic");
     |                                                                  ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  10 |   await expect(cards).toHaveCount(1);
  11 |   await expect(cards.first()).toContainText("Forms");
  12 |   await cards.first().focus();
  13 |   await cards.first().press("Enter");
  14 |   await expect(page).toHaveURL(/#forms$/);
  15 |   await expect(page.getByRole("heading", { name: "Forms", exact: true })).toBeVisible();
  16 |   await expect(page.locator("#main")).toBeFocused();
  17 |   await expect(page.locator(".showcase")).toHaveCount(2);
  18 |   await page.goBack();
  19 |   await expect(page).toHaveTitle("Overview · ROM UI");
  20 | });
  21 | 
  22 | test("shared previews respect reduced motion and retain working controls", async ({ page }) => {
  23 |   await page.emulateMedia({ reducedMotion: "reduce" });
  24 |   await page.goto("/#controls");
  25 |   await expect(page.locator(".showcase")).toHaveCount(4);
  26 |   for (const panel of await page.locator(".showcase").all()) {
  27 |     await expect(panel).toHaveCSS("animation-name", "none");
  28 |   }
  29 |   await page.getByLabel("Project name").fill("Shared preview");
  30 |   await expect(page.getByTestId("control-value")).toHaveText("Shared preview");
  31 |   await page.getByRole("button", { name: "Compositions", exact: true }).click();
  32 |   await expect(page.locator("#main")).toBeFocused();
  33 |   await expect(page.locator(".showcase")).toHaveCount(5);
  34 | });
  35 | 
```
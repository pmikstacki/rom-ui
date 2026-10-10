<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { Button } from "../../components/ui/button/index.js";

  // The caller supplies a bounded-height host, form/IME semantics and optional
  // follow-latest behavior through bodyRef. This component owns only geometry.
  let {
    label,
    bodyLabel,
    header,
    history,
    body,
    footer,
    expansion,
    expanded = $bindable(false),
    bodyRef = $bindable(null),
  }: {
    label: string;
    bodyLabel: string;
    header: Snippet;
    history?: Snippet;
    body: Snippet;
    footer: Snippet;
    expansion?: { expandLabel: string; collapseLabel: string };
    expanded?: boolean;
    bodyRef?: HTMLDivElement | null;
  } = $props();

  let frame: HTMLElement;
  onMount(() => {
    const compact = window.matchMedia("(max-width: 799px)");
    let expansionFocused = false;
    const trackFocus = (event: FocusEvent) => {
      const target = event.target;
      expansionFocused =
        target instanceof Element &&
        frame.contains(target) &&
        !!target.closest(".expansion-control");
    };
    const clearFocus = () => {
      expansionFocused = false;
    };
    const trackDeparture = () => {
      // CSS hides the control after the media query changes. An earlier blur
      // is a deliberate departure and must not grant later focus ownership.
      if (!compact.matches) clearFocus();
    };
    const trackPointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(
        target instanceof Element &&
        frame.contains(target) &&
        target.closest(".expansion-control")
      ))
        clearFocus();
    };
    const preserveFocus = () => {
      if (compact.matches && expansionFocused) {
        frame.focus({ preventScroll: true });
      }
    };
    document.addEventListener("focusin", trackFocus);
    document.addEventListener("focusout", trackDeparture);
    document.addEventListener("pointerdown", trackPointer);
    window.addEventListener("blur", clearFocus);
    compact.addEventListener("change", preserveFocus);
    return () => {
      document.removeEventListener("focusin", trackFocus);
      document.removeEventListener("focusout", trackDeparture);
      document.removeEventListener("pointerdown", trackPointer);
      window.removeEventListener("blur", clearFocus);
      compact.removeEventListener("change", preserveFocus);
    };
  });
</script>

<section
  bind:this={frame}
  tabindex="-1"
  aria-label={label}
  class:expanded
  class="conversation-layout rounded-lg border bg-card text-card-foreground"
>
  <header class="layout-header border-b p-3">
    <div class="min-w-0 flex-1">{@render header()}</div>
    {#if expansion}
      <Button
        class="expansion-control shrink-0"
        variant="ghost"
        size="sm"
        aria-label={expanded ? expansion.collapseLabel : expansion.expandLabel}
        aria-pressed={expanded}
        onclick={() => (expanded = !expanded)}
      >
        {expanded ? expansion.collapseLabel : expansion.expandLabel}
      </Button>
    {/if}
  </header>
  {#if history}
    <div class="layout-history border-b p-3">{@render history()}</div>
  {/if}
  <!-- This named scroll region needs a keyboard tab stop in WebKit. Svelte's
       generic noninteractive-element rule does not model native scrolling.
       See https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow#accessibility -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    bind:this={bodyRef}
    data-rom-conversation-body
    tabindex="0"
    role="region"
    aria-label={bodyLabel}
    class="layout-body p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
  >
    {@render body()}
  </div>
  <footer class="layout-footer border-t p-3">{@render footer()}</footer>
</section>

<style>
  .conversation-layout {
    display: flex;
    flex-direction: column;
    width: min(100%, var(--rom-conversation-width, 35rem));
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .conversation-layout.expanded {
    width: min(100%, var(--rom-conversation-expanded-width, 52.5rem));
  }
  .layout-header {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    flex: 0 0 auto;
    min-height: 0;
    max-height: 20%;
    overflow: auto;
  }
  .layout-history {
    flex: 0 0 auto;
    min-height: 0;
    max-height: 25%;
    overflow: auto;
    overscroll-behavior: contain;
  }
  .layout-body {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    overflow-anchor: none;
    overscroll-behavior: contain;
  }
  .layout-footer {
    flex: 0 0 auto;
    min-width: 0;
    min-height: 0;
    max-height: 40%;
    overflow: auto;
  }
  @media (max-width: 799px) {
    .conversation-layout,
    .conversation-layout.expanded {
      width: 100%;
    }
    .layout-header :global(.expansion-control) {
      display: none;
    }
    .layout-footer {
      padding-left: max(0.75rem, env(safe-area-inset-left));
      padding-right: max(0.75rem, env(safe-area-inset-right));
      padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .conversation-layout {
      animation: none;
      transition: none;
    }
  }
</style>

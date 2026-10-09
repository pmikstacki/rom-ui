<script lang="ts">
  import { onDestroy, tick, type Snippet } from "svelte";
  import { tween } from "@animotion/motion";
  import { createFlexController, type FlexResult } from "./controller.js";
  import { serializeDocument } from "./document-queue.js";

  let {
    children,
    label = "View",
    native = false,
    duration = 180,
    class: className = "",
  }: {
    children: Snippet;
    label?: string;
    native?: boolean;
    duration?: number;
    class?: string;
  } = $props();
  const opacity = tween(1);
  let element: HTMLDivElement;
  let destroyed = false;
  const reducedMotion = () =>
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const controller = createFlexController({
    reducedMotion,
    settle: tick,
    animate: async () => {
      await opacity.to(0.35, { duration: 0 });
      if (destroyed) return;
      await opacity.to(1, { duration: Math.max(0, duration) });
    },
    cancel: () => opacity.reset(),
    startViewTransition: (update) => {
      if (!native || !element?.ownerDocument.startViewTransition)
        throw new Error("Native snapshots unavailable");
      return element.ownerDocument.startViewTransition(update);
    },
  });

  /** The caller owns state and data. Use a synchronous callback after data is ready. */
  export function run(
    update: () => void,
    options: { focus?: () => HTMLElement | null | undefined } = {},
  ): Promise<FlexResult> {
    const document = element?.ownerDocument;
    const originalFocus = document?.activeElement;
    const perform = async () => {
      const result = await controller.run(update);
      if (
        result === "finished" &&
        !destroyed &&
        document &&
        options.focus &&
        (document.activeElement === originalFocus ||
          document.activeElement === document.body)
      ) {
        options.focus()?.focus({ preventScroll: true });
      }
      return result;
    };
    return native && document
      ? serializeDocument(document, perform)
      : perform();
  }
  onDestroy(() => {
    destroyed = true;
    controller.destroy();
  });
</script>

<div
  bind:this={element}
  class={className}
  role="region"
  aria-label={label}
  data-rom-flex=""
  data-rom-flex-scope={native ? "document" : "local"}
  style:opacity={opacity.current}
>
  {@render children()}
</div>

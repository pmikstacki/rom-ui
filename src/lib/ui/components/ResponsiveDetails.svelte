<script lang="ts">
  import type { Snippet } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import * as Sheet from "../../components/ui/sheet/index.js";
  import { Button } from "../../components/ui/button/index.js";
  import { preserveEditor, hasFocusedEditor } from "./preserve-editor.ts";
  import { lockDetailsScroll } from "./details-scroll-lock.ts";

  let {
    open = $bindable(false),
    onOpenChange = () => {},
    children, title, description, closeLabel, label = title, id,
    breakpoint = "(max-width: 1279px)",
    opener = null,
    fallbackFocus = () => {},
    desktopRole = "region",
    showDesktopHeader = true,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: Snippet;
    title: string;
    description: string;
    closeLabel: string;
    label?: string;
    id?: string;
    breakpoint?: string;
    opener?: HTMLElement | null;
    fallbackFocus?: () => void;
    desktopRole?: "region" | "complementary";
    showDesktopHeader?: boolean;
  } = $props();
  const mobile = $derived(new MediaQuery(breakpoint));
  let desktopTarget = $state<HTMLDivElement | null>(null);
  let mobileTarget = $state<HTMLDivElement | null>(null);
  const sheetOpen = $derived(mobile.current && open);

  function returnFocus() {
    if (opener?.isConnected && !opener.matches(":disabled") &&
        opener.getAttribute("aria-disabled") !== "true" && !opener.closest("[inert]"))
      opener.focus({ preventScroll: true });
    else fallbackFocus();
  }
  function changeOpen(next: boolean) {
    open = next;
    onOpenChange(next);
  }
  // Force-mounted editor hosts must not acquire the inactive Sheet's scroll lock.
  $effect(() => {
    if (!sheetOpen) return;
    return lockDetailsScroll(document.body);
  });
</script>

<Sheet.Root open={sheetOpen} onOpenChange={(next) => {
  if (mobile.current) changeOpen(next);
}}>
  <aside
    id={mobile.current ? undefined : id}
    hidden={mobile.current || !open}
    role={desktopRole}
    class="min-w-0 rounded-lg border bg-card p-4 xl:sticky xl:top-4"
    aria-label={label}
  >
    {#if showDesktopHeader}
      <header class="mb-4 flex items-center justify-between gap-4">
        <h2 class="font-semibold">{title}</h2>
        <Button variant="ghost" size="icon-sm" aria-label={closeLabel} onclick={() => {
          changeOpen(false);
          if (!open) returnFocus();
        }}><ChevronRightIcon /></Button>
      </header>
    {/if}
    <div bind:this={desktopTarget}></div>
  </aside>
  <Sheet.Content
    data-rom-responsive-details
    id={mobile.current ? id : undefined}
    side="right"
    forceMount
    preventScroll={false}
    onOpenAutoFocus={(event) => {
      if (hasFocusedEditor(mobileTarget)) event.preventDefault();
    }}
    onCloseAutoFocus={(event) => {
      event.preventDefault();
      if (mobile.current && !open) returnFocus();
    }}
    hidden={!sheetOpen}
    class="data-[side=right]:w-full data-[side=right]:sm:max-w-xl overflow-y-auto p-4"
    showCloseButton={false}
  >
    <Sheet.Header class="pr-8">
      <Sheet.Title>{title}</Sheet.Title>
      <Sheet.Description class="sr-only">{description}</Sheet.Description>
    </Sheet.Header>
    <Sheet.Close>
      {#snippet child({ props })}
        <Button {...props} variant="ghost" size="icon-sm" class="absolute top-4 right-4" aria-label={closeLabel}><ChevronRightIcon /></Button>
      {/snippet}
    </Sheet.Close>
    <div bind:this={mobileTarget}></div>
  </Sheet.Content>
  <div use:preserveEditor={mobile.current ? mobileTarget : desktopTarget} class="min-w-0">
    {@render children()}
  </div>
</Sheet.Root>

<style>
  @media (prefers-reduced-motion: reduce) {
    :global([data-rom-responsive-details]) {
      animation: none !important;
      transition: none !important;
    }
  }
</style>

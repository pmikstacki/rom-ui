<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import { Button } from "../../components/ui/button/index.js";
  import {
    createCompositionCommand,
    type CompositionCommandResult,
    type CompositionCommandStatus,
  } from "./selection-card.ts";
  let {
    id,
    title,
    selected,
    onToggle,
    authorityToken,
    recoveryToken = 0,
    disabled = false,
    failedLabel,
    unknownLabel,
    children,
    actions,
  }: {
    id: string;
    title: string;
    selected: boolean;
    onToggle: (
      id: string,
    ) => CompositionCommandResult | Promise<CompositionCommandResult>;
    authorityToken: unknown;
    recoveryToken?: unknown;
    disabled?: boolean;
    failedLabel: string;
    unknownLabel: string;
    children: Snippet;
    actions?: Snippet;
  } = $props();
  let status = $state<CompositionCommandStatus>("idle");
  const command = createCompositionCommand((next) => (status = next));
  const blocked = $derived(
    disabled || status === "pending" || status === "unknown",
  );
  $effect(() => {
    authorityToken;
    recoveryToken;
    id;
    selected;
    command.reset();
  });
  onDestroy(() => command.dispose());
  function toggle() {
    if (blocked) return;
    const owner = authorityToken,
      recovery = recoveryToken,
      key = id,
      selection = selected;
    void command.run(
      () => onToggle(key),
      () =>
        Object.is(owner, authorityToken) &&
        Object.is(recovery, recoveryToken) &&
        key === id &&
        selection === selected,
    );
  }
</script>

<div class="min-w-0 space-y-2" aria-busy={status === "pending"}>
  <Button
    type="button"
    variant={selected ? "secondary" : "outline"}
    class="h-auto w-full min-w-0 justify-start whitespace-normal p-3 text-left"
    aria-label={title}
    aria-pressed={selected}
    disabled={blocked}
    onclick={toggle}
  >
    <span class="grid min-w-0 gap-1 break-all"
      ><span class="font-medium">{title}</span>{@render children()}</span
    >
  </Button>
  {#if actions}<div class="flex flex-wrap gap-2">{@render actions()}</div>{/if}
  {#if status === "rejected"}<p role="status" class="text-sm text-destructive">
      {failedLabel}
    </p>{:else if status === "unknown"}<p role="status" class="text-sm">
      {unknownLabel}
    </p>{/if}
</div>

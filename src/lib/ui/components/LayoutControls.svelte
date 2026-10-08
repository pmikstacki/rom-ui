<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button } from "../../components/ui/button/index.js";
  import {
    validateLayout,
    type LayoutItem,
    type LayoutOptions,
  } from "../layout.ts";
  import {
    captureLayoutOptions,
    proposeLayoutChange,
    layoutActions,
    type LayoutCommand,
    type LayoutControlsLabels,
  } from "./layout-controls.ts";
  import {
    createCompositionCommand,
    type CompositionCommandResult,
    type CompositionCommandStatus,
  } from "./selection-card.ts";
  let {
    layout,
    options,
    label,
    itemLabel,
    labels,
    onChange,
    authorityToken,
    recoveryToken = 0,
    disabled = false,
  }: {
    layout: readonly LayoutItem[];
    options: LayoutOptions;
    label: string;
    itemLabel: (id: string) => string;
    labels: LayoutControlsLabels;
    onChange: (
      command: Readonly<LayoutCommand>,
      proposal: readonly Readonly<LayoutItem>[],
    ) => CompositionCommandResult | Promise<CompositionCommandResult>;
    authorityToken: unknown;
    recoveryToken?: unknown;
    disabled?: boolean;
  } = $props();
  const config = $derived(captureLayoutOptions(options));
  const admitted = $derived(validateLayout(layout, config));
  let status = $state<CompositionCommandStatus>("idle");
  const barrier = createCompositionCommand((next) => (status = next));
  const blocked = $derived(
    disabled || status === "pending" || status === "unknown",
  );
  $effect(() => {
    authorityToken;
    recoveryToken;
    layout;
    config;
    barrier.reset();
  });
  onDestroy(() => barrier.dispose());
  function change(id: string, action: LayoutCommand["action"]) {
    if (blocked) return;
    const owner = authorityToken,
      recovery = recoveryToken,
      source = layout,
      configuration = config;
    const current = () =>
      Object.is(owner, authorityToken) &&
      Object.is(recovery, recoveryToken) &&
      source === layout &&
      configuration === config;
    const command = Object.freeze({ id, action });
    const next = proposeLayoutChange(source, config, command);
    if (!next.valid || !current() || blocked) return;
    void barrier.run(() => onChange(command, next.layout), current);
  }
</script>

<fieldset
  class="min-w-0 space-y-3 rounded-md border p-3"
  aria-busy={status === "pending"}
>
  <legend class="px-1 text-sm font-medium">{label}</legend>
  {#if admitted.valid}
    {#each admitted.layout as item (item.id)}
      <div class="min-w-0 space-y-2">
        <p class="break-all text-sm font-medium">{itemLabel(item.id)}</p>
        <div class="flex flex-wrap gap-2">
          {#each layoutActions.filter((action) => action !== (item.visible ? "show" : "hide")) as action}
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`${labels[action]} ${itemLabel(item.id)}`}
              disabled={blocked ||
                !proposeLayoutChange(admitted.layout, config, {
                  id: item.id,
                  action,
                }).valid}
              onclick={() => change(item.id, action)}>{labels[action]}</Button
            >
          {/each}
        </div>
      </div>
    {/each}
  {:else}<p role="status" class="text-sm text-destructive">
      {labels.invalid}
    </p>{/if}
  {#if status === "rejected"}<p role="status" class="text-sm text-destructive">
      {labels.failed}
    </p>{:else if status === "unknown"}<p role="status" class="text-sm">
      {labels.unknown}
    </p>{/if}
</fieldset>

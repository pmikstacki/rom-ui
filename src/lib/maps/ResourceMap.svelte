<script lang="ts">
  import { onDestroy, type ComponentProps, type Snippet } from "svelte";
  import Map from "./Map.svelte";
  import MapMarker from "./MapMarker.svelte";
  import MarkerContent from "./MarkerContent.svelte";
  import MapControls from "./MapControls.svelte";
  import type { Map as MapInstance } from "maplibre-gl";
  import { Button } from "../components/ui/button/index.js";
  import { captureMapResources, type MapResourcePoint } from "./resources.ts";
  import {
    createCompositionCommand,
    type CompositionCommandStatus,
    type CompositionCommandResult,
  } from "../ui/components/selection-card.ts";
  let {
    map = $bindable(null),
    children,
    points,
    selectedId,
    authorityToken,
    recoveryToken = 0,
    onSelect,
    failedLabel,
    unknownLabel,
    label,
    mapOptions = {},
    maxPoints = 200,
    disabled = false,
    controls = {},
  }: {
    map?: MapInstance | null;
    children?: Snippet;
    points: readonly MapResourcePoint[];
    selectedId: string | null;
    authorityToken: unknown;
    recoveryToken?: unknown;
    onSelect: (
      id: string,
    ) => CompositionCommandResult | Promise<CompositionCommandResult>;
    label: string;
    failedLabel: string;
    unknownLabel: string;
    mapOptions?: Omit<ComponentProps<typeof Map>, "children" | "label" | "map">;
    controls?: ComponentProps<typeof MapControls>;
    maxPoints?: number;
    disabled?: boolean;
  } = $props();
  const rows = $derived(captureMapResources(points, maxPoints));
  let status = $state<CompositionCommandStatus>("idle");
  const command = createCompositionCommand((next) => {
    status = next;
  });
  const blocked = $derived(
    disabled || status === "pending" || status === "unknown",
  );
  $effect(() => {
    authorityToken;
    recoveryToken;
    selectedId;
    command.reset();
  });
  onDestroy(() => command.dispose());
  function select(id: string) {
    if (blocked) return;
    const owner = authorityToken,
      recovery = recoveryToken,
      selected = selectedId;
    void command.run(
      () => onSelect(id),
      () =>
        Object.is(owner, authorityToken) &&
        Object.is(recovery, recoveryToken) &&
        selected === selectedId,
    );
  }
</script>

<div class="relative h-full w-full" aria-busy={status === "pending"}>
  <Map {...mapOptions} {label} bind:map>
    {#each rows as point (point.id)}
      <MapMarker longitude={point.longitude} latitude={point.latitude}>
        <MarkerContent>
          <Button
            variant={selectedId === point.id ? "default" : "outline"}
            size="sm"
            class="rounded-full shadow-md"
            aria-pressed={selectedId === point.id}
            disabled={blocked}
            onclick={() => select(point.id)}>{point.title}</Button
          >
        </MarkerContent>
      </MapMarker>
    {/each}
    <MapControls {...controls} />
    {@render children?.()}
  </Map>
  {#if status === "rejected"}<p
      role="status"
      class="absolute inset-x-4 top-4 z-20 rounded-md border bg-card p-3 text-sm text-destructive"
    >
      {failedLabel}
    </p>{:else if status === "unknown"}<p
      role="status"
      class="absolute inset-x-4 top-4 z-20 rounded-md border bg-card p-3 text-sm"
    >
      {unknownLabel}
    </p>{/if}
</div>

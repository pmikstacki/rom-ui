<script lang="ts">
  import { ResourceMap, type MapResourcePoint } from "rom-ui/maps";
  import type { StyleSpecification } from "maplibre-gl";
  import "./map-worker";
  import type { ProjectedView, ResourceDescriptor } from "rom-studio/client";
  let { record, descriptor, disabled, authorityToken, recoveryToken, select }: {
    record: ProjectedView;
    descriptor: ResourceDescriptor;
    disabled: boolean;
    authorityToken: unknown;
    recoveryToken: unknown;
    select: (id: string) => Promise<"accepted" | "rejected" | "unknown">;
  } = $props();
  const scene = $derived.by(() => {
    const value = record.value;
    if (!value || typeof value !== "object" || Array.isArray(value)
      || typeof value.points !== "string" || typeof value.style !== "string"
      || value.points.length > 65536 || value.style.length > 1048576) return null;
    try {
      const points: unknown = JSON.parse(value.points);
      const envelope = JSON.parse(value.style);
      if (!Array.isArray(points) || points.length > 200 || !points.length
        || points.some(point => !point || typeof point.id !== "string" || !point.id
          || typeof point.title !== "string" || typeof point.longitude !== "number"
          || typeof point.latitude !== "number" || !Number.isFinite(point.longitude)
          || !Number.isFinite(point.latitude) || Math.abs(point.longitude) > 180
          || Math.abs(point.latitude) > 90)
        || new Set(points.map(point => point.id)).size !== points.length
        || envelope?.style?.version !== 8 || !Array.isArray(envelope.approvedOrigins)
        || !envelope.approvedOrigins.length || envelope.approvedOrigins.length > 2
        || envelope.approvedOrigins.some((origin: unknown) => origin !== "https://tile.openstreetmap.org" && origin !== "https://tiles.openfreemap.org")
        || !Array.isArray(envelope.credits)
        || envelope.credits.length > 16 || !envelope.credits.length
        || envelope.credits.some((credit: { text?: unknown; link?: unknown }) =>
          typeof credit.text !== "string" || (credit.link != null
            && (typeof credit.link !== "string" || !credit.link.startsWith("https://"))))) return null;
      const selected = typeof value.selected === "string" ? value.selected : null;
      if (selected !== null && !points.some(point => point.id === selected)) return null;
      return { points: points as MapResourcePoint[], selected,
        style: envelope.style as StyleSpecification,
        credits: envelope.credits as { text: string; link?: string | null }[] };
    } catch { return null; }
  });
  const canSelect = $derived(descriptor.actions.includes("select")
    && descriptor.action_inputs.some(action => action.name === "select"
      && action.input?.type === "scalar" && action.input.value.shape.type === "string"));
</script>

<section aria-label="ROM map">
  {#if scene}
    <p>Selected place: <output data-testid="rom-map-selection">{scene.selected ?? "None"}</output></p>
    {#if !canSelect}<p>Selection is read-only for this view.</p>{/if}
    <div style="height: 420px" data-testid="rom-map-canvas">
      <ResourceMap points={scene.points} selectedId={scene.selected} {authorityToken} {recoveryToken}
        disabled={disabled || !canSelect} onSelect={select} label="ROM places in Kraków"
        failedLabel="Selection was rejected." unknownLabel="Selection outcome is unknown. Restore and retry the saved mutation."
        mapOptions={{ center: [19.94, 50.056], zoom: 13,
          styles: { light: scene.style, dark: scene.style } }} />
    </div>
    <p>{#each scene.credits as credit}{#if credit.link}<a href={credit.link} target="_blank" rel="noopener noreferrer">{credit.text}</a>{:else}{credit.text}{/if} {/each}</p>
  {:else}
    <p>The current session has no supported map scene.</p>
  {/if}
</section>

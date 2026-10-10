<script lang="ts">
  import { Map, MapArc, MapClusterLayer } from "rom-ui/maps";
  import { setWorkerUrl, type Map as MapInstance } from "maplibre-gl";
  import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
  setWorkerUrl(workerUrl);
  let map = $state<MapInstance | null>(null);
  let viewport = $state({ center: [0, 0] as [number, number], zoom: 2 });
  let interactive = $state(false);
  let actualZoom = $state(0);
  let changedDuringMotion = $state(false);
  let hitLayer = $state(false);
  let clicked = $state("");
  let dataset = $state("/cluster-a.geojson");
  let datasetLabel = $state("");
  const arcs = [
    {
      id: "exact/arc",
      from: [-1, 0] as [number, number],
      to: [1, 0] as [number, number],
    },
  ];
  $effect(() => {
    const instance = map;
    if (!instance) return;
    const update = () => {
      actualZoom = instance.getZoom();
      hitLayer = !!instance.getLayer("arc-hit-layer-fixture");
      if (instance.isStyleLoaded())
        datasetLabel = instance
          .queryRenderedFeatures()
          .filter((f) => f.layer.id.startsWith("unclustered-point-"))
          .map((f) => f.properties.label)
          .join(",");
    };
    instance.on("idle", update);
    instance.on("moveend", update);
    return () => {
      instance.off("idle", update);
      instance.off("moveend", update);
    };
  });
</script>

<button
  onclick={() => {
    map?.easeTo({ zoom: 6, duration: 600, essential: true });
    setTimeout(() => {
      changedDuringMotion = !!map?.isMoving();
      viewport = { ...viewport, zoom: 8 };
    }, 100);
  }}>Change controlled viewport during movement</button
>
<button
  onclick={() => {
    interactive = !interactive;
  }}>Toggle arc interaction</button
>
<button
  onclick={() => {
    dataset = "/cluster-b.geojson";
  }}>Change GeoJSON URL</button
>
<output data-testid="dataset">{datasetLabel}</output>
<output data-testid="zoom">{actualZoom.toFixed(2)}</output>
<output data-testid="during-motion">{String(changedDuringMotion)}</output>
<output data-testid="hit-layer">{String(hitLayer)}</output>
<output data-testid="arc-click">{clicked}</output>
<div style="width:600px;height:400px">
  <Map bind:map {viewport} onviewportchange={() => {}} label="Fixture map">
    <MapClusterLayer data={dataset} />
    <MapArc
      id="fixture"
      data={arcs}
      {interactive}
      curvature={0}
      onclick={(event) => {
        clicked = String(event.arc.id);
      }}
    />
  </Map>
</div>

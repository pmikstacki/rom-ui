<script lang="ts">
  import Showcase from "./Showcase.svelte";
  import {
    setWorkerUrl,
    type Map as MapInstance,
    type StyleSpecification,
  } from "maplibre-gl";
  import MapWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
  import {
    ResourceMap,
    MapClusterLayer,
    MapGeoJSON,
    MapRoute,
    RouteProgress,
    MapPopup,
    type MapResourcePoint,
  } from "rom-ui/maps";
  import { Button, Slider, Label } from "rom-ui/controls";
  setWorkerUrl(MapWorker);
  let map = $state<MapInstance | null>(null);
  let selectedId = $state<string | null>(null);
  let authority = $state(0);
  let recovery = $state(0);
  let reject = $state(false);
  let unknown = $state(false);
  let progress = $state([0.35]);
  let popup = $state(false);
  let clusters = $state(false);
  let clusterCount = $state(0);
  let basemap = $state(
    new URLSearchParams(window.location.search).get("basemap") === "schematic"
      ? "schematic"
      : "streets",
  );
  let streetFeatures = $state(0);
  const clusterData: import("geojson").FeatureCollection<
    import("geojson").Point
  > = {
    type: "FeatureCollection",
    features: Array.from({ length: 12 }, (_, i) => ({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Point" as const,
        coordinates: [19.91 + i * 0.00001, 50.075],
      },
    })),
  };
  $effect(() => {
    const instance = map;
    if (!instance) return;
    const update = () => {
      if (!instance.isStyleLoaded()) return;
      streetFeatures = instance
        .queryRenderedFeatures()
        .filter((f) => f.source === "openmaptiles").length;
      clusterCount = instance
        .queryRenderedFeatures()
        .filter((f) => f.layer.id.startsWith("clusters-")).length;
    };
    instance.on("idle", update);
    return () => {
      instance.off("idle", update);
    };
  });
  let zoom = $state(12);
  const points: MapResourcePoint[] = [
    { id: "resource/a", title: "Point A", longitude: 19.89, latitude: 50.065 },
    { id: "resource/b", title: "Point B", longitude: 19.925, latitude: 50.055 },
    { id: "resource/c", title: "Point C", longitude: 19.96, latitude: 50.07 },
  ];
  const schematicStyles: {
    light: StyleSpecification;
    dark: StyleSpecification;
  } = {
    light: {
      version: 8,
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": "#e8eee2" },
        },
      ],
    },
    dark: {
      version: 8,
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": "#1f2c25" },
        },
      ],
    },
  };
  const styles = $derived(
    basemap === "streets"
      ? {
          light: "https://tiles.openfreemap.org/styles/positron",
          dark: "https://tiles.openfreemap.org/styles/dark",
        }
      : schematicStyles,
  );
  const area: import("geojson").FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "park",
        properties: { name: "Demo area" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [19.87, 50.05],
              [19.9, 50.05],
              [19.9, 50.08],
              [19.87, 50.08],
              [19.87, 50.05],
            ],
          ],
        },
      },
    ],
  };
  const coordinates: [number, number][] = [
    [19.89, 50.065],
    [19.9, 50.06],
    [19.925, 50.055],
    [19.94, 50.06],
    [19.96, 50.07],
  ];
  async function select(id: string) {
    const owner = authority;
    const rejecting = reject;
    const uncertain = unknown;
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (owner !== authority) return "rejected" as const;
    if (rejecting) return "rejected" as const;
    if (uncertain) return "unknown" as const;
    selectedId = id;
    return "accepted" as const;
  }
</script>

<div class="maps-intro">
  <div>
    <span class="mini-tag">MAPCN-SVELTE / MAPLIBRE</span>
    <p class="muted">Resources, layers and routes in the shared ROM theme.</p>
  </div>
  <Button
    variant="outline"
    onclick={() => {
      map?.jumpTo({ center: [19.925, 50.065], zoom: 12 });
    }}>Reset view</Button
  >
</div>
<Showcase title="Resource map" api="ResourceMap · MapGeoJSON · MapRoute" number="01" level={3} class="map-example">
  <p class="muted">
    Explore the streets of Kraków and select a demo resource. The points and
    route are illustrative.
  </p>
  <div class="map-summary">
    <label
      >Basemap <select aria-label="Basemap" bind:value={basemap}
        ><option value="streets">Street map</option><option value="schematic"
          >Schematic</option
        ></select
      ></label
    >
    <span
      >Exact ID: <strong data-testid="map-selection">{selectedId ?? "—"}</strong
      ></span
    ><span>Zoom: {zoom.toFixed(1)}</span><Button
      variant="ghost"
      size="sm"
      onclick={() => {
        popup = !popup;
      }}>About this map</Button
    >
  </div>
  <div
    class="map-canvas"
    data-basemap-features={streetFeatures}
    data-basemap={basemap}
  >
    <ResourceMap
      {points}
      {selectedId}
      authorityToken={authority}
      recoveryToken={recovery}
      onSelect={select}
      bind:map
      label="Resource map"
      failedLabel="Resource selection was rejected."
      unknownLabel="Confirm the selection outcome before continuing."
      mapOptions={{
        styles,
        center: [19.925, 50.065],
        zoom: 12,
        loadingLabel: "Loading map",
        errorLabel: "The map could not be loaded. Try the schematic view.",
        options: { scrollZoom: false, attributionControl: { compact: false } },
        onviewportchange: (viewport) => {
          zoom = viewport.zoom;
        },
      }}
      controls={{
        showCompass: true,
        labels: {
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
          compass: "Reset north",
          locate: "My location",
          fullscreen: "Fullscreen",
        },
      }}
    >
      {#if clusters}<MapClusterLayer data={clusterData} />{/if}
      <MapGeoJSON
        id="gallery-area"
        data={area}
        fillPaint={{ "fill-color": "#9fb889", "fill-opacity": 0.3 }}
        linePaint={{ "line-color": "#8ba578", "line-width": 2 }}
      />
      <MapRoute
        id="gallery-route"
        {coordinates}
        color="#a9b29c"
        width={5}
        progress={progress[0]}
        ><RouteProgress color="#526e46" width={5} /></MapRoute
      >
      {#if popup}<MapPopup
          longitude={19.925}
          latitude={50.08}
          closeButton={true}
          closeLabel="Close map information"
          onclose={() => {
            popup = false;
          }}
          ><strong>Your data source</strong>
          <p class="muted">
            The host selects a map provider and supplies disclosed resources.
            The control does not fetch ROM records.
          </p></MapPopup
        >{/if}
    </ResourceMap>
  </div>
  <div class="map-progress">
    <Label for="route-progress"
      >Route progress · {Math.round(progress[0] * 100)}%</Label
    ><Slider
      type="multiple"
      id="route-progress"
      bind:value={progress}
      min={0}
      max={1}
      step={0.01}
      aria-label="Route progress"
    />
  </div>
  <div class="code-line">
    import &#123; ResourceMap, MapRoute, MapGeoJSON &#125; from 'rom-ui/maps';
  </div>
</Showcase>
<div class="demo-options">
  <label class="checkbox-row"
    ><input type="checkbox" bind:checked={clusters} /> Show clusters</label
  >
  <span
    >Visible clusters: <span data-testid="map-cluster-count"
      >{clusterCount}</span
    ></span
  >
  <label class="checkbox-row"
    ><input type="checkbox" bind:checked={reject} /> Simulate rejected selection</label
  ><label class="checkbox-row"
    ><input type="checkbox" bind:checked={unknown} /> Simulate unknown outcome</label
  ><Button
    variant="outline"
    size="sm"
    onclick={() => {
      recovery++;
      unknown = false;
    }}>Confirm outcome</Button
  >
</div>
<div class="note-row">
  <span class="mini-tag">ADAPTED TO ROM</span>
  <p>
    Exact IDs, explicit selection outcomes and host-controlled data. Choose your
    own styles and tile provider.
  </p>
</div>

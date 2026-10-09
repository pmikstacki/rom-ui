<script lang="ts">
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
    { id: "resource/a", title: "Punkt A", longitude: 19.89, latitude: 50.065 },
    { id: "resource/b", title: "Punkt B", longitude: 19.925, latitude: 50.055 },
    { id: "resource/c", title: "Punkt C", longitude: 19.96, latitude: 50.07 },
  ];
  const styles: { light: StyleSpecification; dark: StyleSpecification } = {
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
  const area: import("geojson").FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "park",
        properties: { name: "Obszar demonstracyjny" },
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
    <p class="muted">Zasoby, warstwy i trasy we wspólnym motywie ROM.</p>
  </div>
  <Button
    variant="outline"
    onclick={() => {
      map?.jumpTo({ center: [19.925, 50.065], zoom: 12 });
    }}>Przywróć widok</Button
  >
</div>
<section class="demo-card map-example">
  <div class="card-heading">
    <span class="specimen-number">01</span>
    <h3>Mapa zasobów</h3>
    <code>ResourceMap · MapGeoJSON · MapRoute</code>
  </div>
  <p class="muted">
    Wybierz punkt na mapie. To schemat danych demonstracyjnych, bez zewnętrznych
    kafelków.
  </p>
  <div class="map-summary">
    <span
      >Dokładny ID: <strong data-testid="map-selection"
        >{selectedId ?? "—"}</strong
      ></span
    ><span>Przybliżenie: {zoom.toFixed(1)}</span><Button
      variant="ghost"
      size="sm"
      onclick={() => {
        popup = !popup;
      }}>Informacje o mapie</Button
    >
  </div>
  <div class="map-canvas">
    <ResourceMap
      {points}
      {selectedId}
      authorityToken={authority}
      recoveryToken={recovery}
      onSelect={select}
      bind:map
      label="Mapa zasobów"
      failedLabel="Nie wybrano zasobu."
      unknownLabel="Wynik wyboru wymaga potwierdzenia."
      mapOptions={{
        styles,
        center: [19.925, 50.065],
        zoom: 12,
        loadingLabel: "Wczytywanie mapy",
        errorLabel: "Ta przeglądarka nie może wyświetlić mapy.",
        options: { scrollZoom: false },
        onviewportchange: (viewport) => {
          zoom = viewport.zoom;
        },
      }}
      controls={{
        showCompass: true,
        labels: {
          zoomIn: "Przybliż mapę",
          zoomOut: "Oddal mapę",
          compass: "Ustaw północ",
          locate: "Moja lokalizacja",
          fullscreen: "Pełny ekran",
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
          closeLabel="Zamknij informacje"
          onclose={() => {
            popup = false;
          }}
          ><strong>Twoje źródło danych</strong>
          <p class="muted">
            Host wybiera styl mapy i przekazuje ujawnione zasoby. Kontrolka nie
            pobiera rekordów z ROM.
          </p></MapPopup
        >{/if}
    </ResourceMap>
  </div>
  <div class="map-progress">
    <Label for="route-progress"
      >Postęp trasy · {Math.round(progress[0] * 100)}%</Label
    ><Slider
      type="multiple"
      id="route-progress"
      bind:value={progress}
      min={0}
      max={1}
      step={0.01}
      aria-label="Postęp trasy"
    />
  </div>
  <div class="code-line">
    import &#123; ResourceMap, MapRoute, MapGeoJSON &#125; from 'rom-ui/maps';
  </div>
</section>
<div class="demo-options">
  <label class="checkbox-row"
    ><input type="checkbox" bind:checked={clusters} /> Pokaż klastry</label
  >
  <span data-testid="map-cluster-count">{clusterCount}</span>
  <label class="checkbox-row"
    ><input type="checkbox" bind:checked={reject} /> Symuluj odrzucenie wyboru</label
  ><label class="checkbox-row"
    ><input type="checkbox" bind:checked={unknown} /> Symuluj wynik nieznany</label
  ><Button
    variant="outline"
    size="sm"
    onclick={() => {
      recovery++;
      unknown = false;
    }}>Potwierdź wynik</Button
  >
</div>
<div class="note-row">
  <span class="mini-tag">DOSTOSOWANE DO ROM</span>
  <p>
    Dokładne identyfikatory, jawne wyniki wyboru i zakres danych kontrolowany
    przez hosta. Style i kafelki pozostają Twoim wyborem.
  </p>
</div>

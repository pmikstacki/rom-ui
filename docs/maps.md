# Maps

Import map components from `rom-ui/maps`. Install the optional `maplibre-gl@6.7.0` peer with pnpm.
Import `rom-ui/styles` and include the package source in your Tailwind scan.

The default map has a background and no remote tiles. Supply explicit light and dark styles for a geographic basemap.
The host selects the provider, credentials, network policy and attribution. Map components do not configure ROM-extras providers.
Keep server credentials outside browser props. Provider styles can request tiles, glyphs and sprites from their configured URLs.

## Local worker

Bundle the worker in the consuming application. This Vite example uses a local asset:

```ts
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
setWorkerUrl(workerUrl);
```

Run this setup before mounting a map. The gallery uses this setup and synthetic local GeoJSON.

## Resource selection

`ResourceMap` accepts bounded point snapshots with exact IDs and finite longitude/latitude coordinates.
Duplicate IDs, invalid coordinates and excess capacity are rejected. Coordinates use longitude before latitude.
The host owns `selectedId`, `authorityToken`, `recoveryToken` and the `onSelect` callback.
Return `accepted`, `rejected` or `unknown` through the public composition command contract.
An unknown result blocks another selection until explicit recovery or an authority change.
A selection callback does not establish a durable ROM mutation or receipt.

Use the bindable map reference and children snippet to compose overlays.
`MapGeoJSON`, `MapRoute`, `RouteProgress`, `MapArc` and `MapClusterLayer` render host-provided geography.
Popup content uses Svelte snippets. Keep authorization and disclosed labels in the host.

## Provenance

The map components adapt the MIT mapcn-svelte source recorded in `evidence/gallery/mapcn-source.json`.
MapLibre uses the BSD-3-Clause license. Preserve the package notices and provider attribution.

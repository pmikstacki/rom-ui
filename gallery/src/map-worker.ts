import { setWorkerUrl } from "maplibre-gl";
import asset from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// Blob workers inherit the document's connection policy. This URL lives for the document lifetime.
const source = `import ${JSON.stringify(new URL(asset, location.href).href)};`;
setWorkerUrl(URL.createObjectURL(new Blob([source], { type: "text/javascript" })));

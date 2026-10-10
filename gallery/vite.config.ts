import { defineConfig } from "vite";
import fs from "node:fs";
const library = JSON.parse(
  fs.readFileSync(
    new URL("./node_modules/rom-ui/package.json", import.meta.url),
    "utf8",
  ),
);
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  define: { __ROM_UI_VERSION__: JSON.stringify(library.version) },
  build: { license: { fileName: "licenses.txt" } },
  plugins: [svelte(), tailwindcss()],
  optimizeDeps: { exclude: ["rom-ui"] },
  resolve: { dedupe: ["svelte"] },
});

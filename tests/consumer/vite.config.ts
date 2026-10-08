import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  build: { rolldownOptions: { input: ["index.html", "details.html", "history.html", "selection-layout.html", "reference.html"] } },
  plugins: [svelte(), tailwindcss()],
  optimizeDeps: { exclude: ["rom-ui"] },
  resolve: { dedupe: ["svelte"] },
});

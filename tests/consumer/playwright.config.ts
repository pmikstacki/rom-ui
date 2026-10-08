import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", workers: 1,
  use: { baseURL: "http://127.0.0.1:43215" },
  webServer: { command: "corepack pnpm exec vite preview --host 127.0.0.1 --port 43215 --strictPort", url: "http://127.0.0.1:43215", reuseExistingServer: false },
  projects: [
    { name: "chromium", use: { browserName: "chromium", launchOptions: { executablePath: process.env.ROM_CHROMIUM_PATH } } },
    { name: "webkit", use: { browserName: "webkit", launchOptions: { executablePath: process.env.ROM_WEBKIT_EXECUTABLE } } },
  ],
});

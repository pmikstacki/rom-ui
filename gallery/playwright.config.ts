import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: { baseURL: process.env.ROM_GALLERY_URL ?? "http://127.0.0.1:43216" },
  webServer: process.env.ROM_GALLERY_URL
    ? undefined
    : {
        command:
          "corepack pnpm exec vite preview --host 127.0.0.1 --port 43216 --strictPort",
        url: "http://127.0.0.1:43216",
        reuseExistingServer: false,
      },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: { executablePath: process.env.ROM_CHROMIUM_PATH, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader-webgl"] },
      },
    },
    {
      name: "webkit",
      use: {
        browserName: "webkit",
        launchOptions: { executablePath: process.env.ROM_WEBKIT_EXECUTABLE },
      },
    },
  ],
});

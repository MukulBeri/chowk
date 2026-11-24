import { defineConfig } from "@playwright/test";
// Reuse the user's running server. Never spawn a duplicate dev/build server.
export default defineConfig({
  outputDir: "test-results/m2-current",
  testDir: "./tests", timeout: 60_000, workers: 1,
  use: {
    baseURL: "http://localhost:3000", browserName: "chromium",
    channel: "chrome", viewport: { width: 1440, height: 1050 },
    deviceScaleFactor: 1, headless: true,
    screenshot: "only-on-failure", trace: "retain-on-failure",
  },
  reporter: "list",
});

import { defineConfig } from "@playwright/test";
// Explicit opt-in command only. The normal regression suite never spends live quota.
export default defineConfig({
  testDir: ".", testMatch: "live-models.spec.ts", timeout: 600000, workers: 1,
  outputDir: "../evaluation-results", reporter: "list",
  use: { baseURL: "http://localhost:3000", browserName: "chromium", channel: "chrome", headless: true, viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 },
});

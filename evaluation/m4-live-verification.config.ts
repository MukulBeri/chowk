import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Stop before Playwright can clear output. Never remove a journal to get a rerun.
const listing = process.argv.includes("--list");
if (!listing && process.env.M4_LIVE_AUTHORIZED !== "two-campaigns-four-calls") throw new Error("Explicit two-campaign/four-call authorization required.");
if (!listing && existsSync(resolve(__dirname, "../docs/evidence/m4/live/journal.json"))) throw new Error("M4 live journal already exists. No repeat generation or output cleanup is authorized.");
if (!listing && process.env.TEST_WORKER_INDEX === undefined && existsSync(resolve(__dirname, "../test-results/m4-live-verification-02"))) throw new Error("Preserve existing live artifacts; inspect the checkpoint before proceeding.");
export default defineConfig({
  testDir: ".", testMatch: "m4-live-verification.spec.ts", outputDir: "../test-results/m4-live-verification-02",
  timeout: 240_000, workers: 1, retries: 0, reporter: "list",
  use: { baseURL: "http://localhost:3000", browserName: "chromium", channel: "chrome", headless: true,
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, trace: "off", video: "off", screenshot: "off" },
});

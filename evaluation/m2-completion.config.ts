import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
// Narrow, owner-authorized verification. Never use the historical benchmark config.
// Check during configuration, before Playwright can clear the output directory.
if (existsSync(resolve(__dirname,"../docs/evidence/m2/typography/live-verification.json")) && !process.argv.includes("--list")) {
  throw new Error("M2 live verification is already recorded. Refusing repeat calls and output cleanup; preserve the journal and artifacts.");
}
export default defineConfig({
  testDir: ".", testMatch: "m2-completion-live.spec.ts", timeout: 180000,
  workers: 1, retries: 0, outputDir: "../evaluation-results/m2-typography-live-01",
  reporter: "list", use: { baseURL: "http://localhost:3000", browserName: "chromium",
    channel: "chrome", headless: true, viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 },
});

import { defineConfig } from "@playwright/test";
import base from "../playwright.config";
export default defineConfig({ ...base, testDir: ".", testMatch: "m4-correction.spec.ts", outputDir: "../test-results/m4-correction-artwork-01", timeout: 90_000 });

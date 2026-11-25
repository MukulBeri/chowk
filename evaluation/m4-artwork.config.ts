import { defineConfig } from "@playwright/test";
import base from "../playwright.config";
export default defineConfig({ ...base, testDir: ".", testMatch: ["m4-artwork.spec.ts", "m4-compatibility.spec.ts"], timeout: 90_000,
  outputDir: "../test-results/m4-artwork-candidate-01", reporter: "list" });

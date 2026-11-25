import {defineConfig} from "@playwright/test";
import base from "../playwright.config";
export default defineConfig({...base,testDir:".",testMatch:"m4-tabler.spec.ts",outputDir:"../test-results/m4-tabler-comparison-01",timeout:60_000});

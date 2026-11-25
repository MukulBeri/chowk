import {defineConfig} from "@playwright/test";
import base from "../playwright.config";
export default defineConfig({...base,testDir:".",testMatch:"m4-edge.spec.ts",outputDir:"../test-results/m4-edge-01",timeout:60_000});

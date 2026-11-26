import {defineConfig} from "@playwright/test";
import base from "../playwright.config";
export default defineConfig({...base,testDir:'.',testMatch:'m7r-private.spec.ts',globalSetup:'../tests/quota-free-setup.ts',outputDir:'../test-results/m7r-20261126-01/private-01'});

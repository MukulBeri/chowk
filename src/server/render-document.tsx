import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server.edge";
import { FORMATS, designSchema, type DesignSpec } from "@/lib/design";
import manifest from "@/lib/design-engine/font-assets.json";
import tabler from "@/lib/design-engine/tabler-asset.json";
import { AdvancedPosterMarkup } from "@/components/advanced-poster-markup";
import { LegacyPosterMarkup } from "@/components/legacy-poster-markup";
import { fitAndInspect } from "@/lib/design-engine/quality";
import { fitLegacyText } from "@/lib/design-engine/legacy-quality";
import { loadCampaignFontFaces, fontFallbackWarnings } from "@/lib/design-engine/fonts";
import { measureCampaignDocument } from "@/lib/design-engine/document-runtime";
import { shareRasterResources } from "@/lib/design-engine/assets";
import { inspectRaster } from "./raster-validation";

let fontBundle: Promise<{ css: string; notices: string }> | undefined;
async function verifiedFile(asset: { path: string; sha256: string }) {
  const bytes = await readFile(path.join(process.cwd(), "public", asset.path.replace(/^\//, "")));
  if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256) throw new Error("Approved font integrity failure");
  return bytes;
}
function fonts() {
  if (!fontBundle) fontBundle = Promise.all([
    Promise.all(manifest.assets.map(async asset => `@font-face{font-family:"${asset.family}";src:url(data:font/woff2;base64,${(await verifiedFile(asset)).toString("base64")}) format("woff2");font-style:normal;font-weight:${asset.weight};font-display:block;unicode-range:${asset.unicodeRange}}`)),
    Promise.all(manifest.licenses.map(async license => `${license.file}\n${(await verifiedFile(license)).toString("utf8")}`)),
  ]).then(([css, notices]) => ({ css: css.join("\n"), notices: notices.join("\n\n") })).catch(error => { fontBundle = undefined; throw error; });
  return fontBundle;
}
export async function renderCampaignDocument(input: DesignSpec) {
  const spec = designSchema.parse(input);
  if (spec.version === 3 && spec.assetLayer && createHash("sha256").update(Buffer.from(spec.assetLayer.dataUrl.split(",")[1], "base64")).digest("hex") !== spec.assetLayer.sha256) throw new Error("Raster integrity failure");
  if (spec.version === 3 && spec.assetLayer) inspectRaster(Buffer.from(spec.assetLayer.dataUrl.split(",")[1], "base64"));
  const bundle = spec.version === 3 ? await fonts() : { css: "", notices: "" };
  const warnings = spec.version === 3 ? fontFallbackWarnings([spec.campaign.headline, spec.campaign.supportingText, spec.campaign.cta].join("\n")) : ["Historical specifications retain system fonts; device equivalence is unverified."];
  const markup = renderToStaticMarkup(<>
    <p id="campaign-status" role="status">Unmeasured artwork. Waiting for trusted browser font and geometry checks.</p>
    <noscript>JavaScript is required for quality verification. This document is not export-ready without those checks.</noscript>
    {warnings.map(warning => <p role="note" key={warning}>{warning}</p>)}
    {FORMATS.map(format => <section key={format.id} data-format={format.id} data-version={spec.version}>
      <h1 style={{font:"16px Arial"}}>{format.name} · {format.width} × {format.height}</h1>
      {spec.version === 3 ? <AdvancedPosterMarkup spec={spec} format={format} /> : <LegacyPosterMarkup spec={spec} format={format} />}
      {spec.version === 3 && [1, 2].map(step => <template key={step} data-step={step}><AdvancedPosterMarkup spec={spec} format={format} correction={step}/></template>)}
    </section>)}
    {bundle.notices && <details><summary>Embedded font licenses and copyright notices</summary><pre>{bundle.notices}</pre></details>}
    {spec.version === 3 && spec.artDirection.visual === "camera" && <details><summary>Artwork asset license and copyright notice</summary><pre>{tabler.license.notice}</pre></details>}
  </>);
  const shared = shareRasterResources(markup);
  const load = spec.version === 3 ? loadCampaignFontFaces.toString() : "async function(){await document.fonts.ready}";
  const script = `(${measureCampaignDocument.toString()})(${fitAndInspect.toString()},${load},${fitLegacyText.toString()});`;
  const digest = createHash("sha256").update(script).digest("base64");
  const html = `<!doctype html><html lang="en" data-render-state="pending"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; script-src 'sha256-${digest}'; base-uri 'none'; form-action 'none'"><title>Campaign · verified browser rendering</title><style>${bundle.css}html,body{margin:0;padding:0;background:#e6e4dc}section{margin:24px;width:max-content}*{box-sizing:border-box}body>p,body>noscript,details{margin:24px;font:14px Arial}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body>${markup}<script>${script}</script></body></html>`;
  const portable = html.replace(markup, shared.html).replace("<style>", `<style>${shared.css}`);
  if (Buffer.byteLength(portable, "utf8") > 1500000) throw new Error("Rendered document exceeds its resource bound");
  return { html: portable, sizes: FORMATS, rendering: { state: "requires-browser-verification" as const, measuredOnServer: false, readinessPromise: "window.yarcCampaignReady", result: "window.yarcCampaignQuality", maximumCorrectionPasses: 3, warnings } };
}

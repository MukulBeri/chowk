import { toBlob } from "html-to-image";
import type { Format } from "./design";
import { embeddedCampaignFonts, prepareCampaignFonts } from "./design-engine/fonts";
import tablerAsset from "./design-engine/tabler-asset.json";
import { shareRasterResources } from "./design-engine/assets";
import {pngProvenance} from './image-provenance';
export function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
async function ensureReady(node: HTMLElement) {
  await document.fonts.ready;
  if (node.dataset.version === "3") await prepareCampaignFonts();
  if (node.dataset.ready !== "true") throw new Error("Layout is still settling. Please try again.");
  if (node.dataset.overflow === "true") throw new Error(node.dataset.version === "3" ? "This format cannot keep all copy readable after layout adjustments. Shorten or reorganize the copy before exporting." : "This copy does not fit. Shorten it before exporting.");
}
export async function nativePngBlob(node: HTMLElement, format: Format) {
  await ensureReady(node);
  const fonts = node.dataset.version === "3" ? await embeddedCampaignFonts() : undefined;
  const blob = await toBlob(node, {
    width: format.width, height: format.height, canvasWidth: format.width, canvasHeight: format.height,
    pixelRatio: 1, skipAutoScale: true, skipFonts: true, style: { transform: "none", margin: "0" },
    // V3 is fully inline. Avoid the library's computed-style font-size reduction
    // and logical-border rewriting; retain the tested legacy path for v1/v2.
    ...(fonts ? { includeStyleProperties: [], skipFonts: false, fontEmbedCSS: fonts.css } : {}),
  });
  if (!blob) throw new Error("The browser could not create a PNG. Try the portable HTML export.");
  const bitmap = await createImageBitmap(blob);
  const valid = bitmap.width === format.width && bitmap.height === format.height;
  bitmap.close();
  if (!valid) throw new Error("Export dimensions did not match the requested format.");
  if(node.dataset.capabilities||node.dataset.providerXmp){const bytes=pngProvenance(new Uint8Array(await blob.arrayBuffer()),node.dataset.providerXmp,node.dataset.capabilities);return new Blob([bytes.buffer as ArrayBuffer],{type:'image/png'});}
  return blob;
}
export async function exportPng(node: HTMLElement, format: Format, filename: string) {
  saveFile(await nativePngBlob(node,format), filename);
}
export async function exportHtml(nodes: HTMLElement[], filename: string) {
  await Promise.all(nodes.map(ensureReady));
  const fonts = nodes.some((node) => node.dataset.version === "3") ? await embeddedCampaignFonts() : undefined;
  // Inline styles and SVG only. React escapes copy; no app CSS or scripts are needed.
  const shared = shareRasterResources(nodes.map((node) => `<section>${node.outerHTML}</section>`).join("\n"));
  const posters = shared.html;
  const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const assetNotice = nodes.some(node=>node.querySelector('[data-asset="tabler-camera"]')) ? `<details><summary>Artwork asset license and copyright notice</summary><pre>${escape(tablerAsset.license.notice)}</pre></details>` : "";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src ${fonts ? "data:" : "'none'"}; base-uri 'none'"><title>Campaign · portable HTML export</title><style>${fonts?.css ?? ""}html,body{margin:0;padding:0;background:#e6e4dc}section{margin:24px;width:max-content}*{box-sizing:border-box}</style></head><body>${posters}${nodes.some(n=>n.dataset.providerXmp)?"<p>AI-generated conceptual imagery; not a verified product photograph. Provider provenance is retained in the embedded source and native PNG metadata. Review image use before publication.</p>":""}${fonts ? `<details><summary>Embedded font licenses and copyright notices</summary><pre>${escape(fonts.notices)}</pre></details>` : ""}${assetNotice}</body></html>`;
  const portable = html.replace("<style>", `<style>${shared.css}`);
  if (new Blob([portable]).size > 1500000) throw new Error("Portable HTML exceeds 1.5 MB. Remove or replace the local image before exporting.");
  saveFile(new Blob([portable], { type: "text/html;charset=utf-8" }), filename);
}

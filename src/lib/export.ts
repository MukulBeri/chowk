import { toBlob } from "html-to-image";
import type { Format } from "./design";
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
  if (node.dataset.ready !== "true") throw new Error("Layout is still settling. Please try again.");
  if (node.dataset.overflow === "true") throw new Error("This copy does not fit. Shorten it before exporting.");
}
export async function exportPng(node: HTMLElement, format: Format, filename: string) {
  await ensureReady(node);
  const blob = await toBlob(node, {
    width: format.width, height: format.height, canvasWidth: format.width, canvasHeight: format.height,
    pixelRatio: 1, skipAutoScale: true, skipFonts: true, style: { transform: "none", margin: "0" },
  });
  if (!blob) throw new Error("The browser could not create a PNG. Try the portable HTML export.");
  const bitmap = await createImageBitmap(blob);
  const valid = bitmap.width === format.width && bitmap.height === format.height;
  bitmap.close();
  if (!valid) throw new Error("Export dimensions did not match the requested format.");
  saveFile(blob, filename);
}
export async function exportHtml(nodes: HTMLElement[], filename: string) {
  await Promise.all(nodes.map(ensureReady));
  // Inline styles and SVG only. React escapes copy; no app CSS or scripts are needed.
  const posters = nodes.map((node) => `<section>${node.outerHTML}</section>`).join("\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; base-uri 'none'"><title>Campaign · experimental HTML export</title><style>html,body{margin:0;padding:0;background:#e6e4dc}section{margin:24px;width:max-content}*{box-sizing:border-box}</style></head><body>${posters}</body></html>`;
  saveFile(new Blob([html], { type: "text/html;charset=utf-8" }), filename);
}

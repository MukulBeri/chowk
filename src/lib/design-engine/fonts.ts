import manifest from "./font-assets.json";

type Bundle = { css: string; notices: string };
let bundle: Promise<Bundle> | undefined;
async function verifiedAsset(path: string, expected: string) {
  const response = await fetch(path, { cache: "force-cache" });
  if (!response.ok) throw new Error("An approved campaign font could not be loaded.");
  const bytes = await response.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const actual = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  if (actual !== expected) throw new Error("Campaign font integrity verification failed.");
  return new Uint8Array(bytes);
}
function base64(bytes: Uint8Array) {
  let text = "";
  for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(text);
}
export function embeddedCampaignFonts(): Promise<Bundle> {
  if (!bundle) bundle = Promise.all([
    Promise.all(manifest.assets.map(async (asset) => {
      const bytes = await verifiedAsset(asset.path, asset.sha256);
      return `@font-face{font-family:"${asset.family}";src:url(data:font/woff2;base64,${base64(bytes)}) format("woff2");font-style:normal;font-weight:${asset.weight};font-display:block;unicode-range:${asset.unicodeRange}}`;
    })),
    Promise.all(manifest.licenses.map(async (license) => `${license.file}\n${new TextDecoder().decode(await verifiedAsset(license.path, license.sha256))}`)),
  ]).then(([css, notices]) => ({ css: css.join("\n"), notices: notices.join("\n\n") })).catch((error) => { bundle = undefined; throw error; });
  return bundle;
}
export async function prepareCampaignFonts() {
  // Explicit face loads precede measurement; loaded status is not glyph proof.
  await embeddedCampaignFonts();
  await loadCampaignFontFaces();
}
export async function loadCampaignFontFaces() {
  const faces = await Promise.all([
    document.fonts.load('400 32px "YarcAnton"', "HamburgefonstivéŁ₹0123456789"),
    document.fonts.load('600 32px "YarcFredoka"', "HamburgefonstivéŁ0123456789"),
    document.fonts.load('400 32px "YarcInter"', "HamburgefonstivéŁ₹0123456789"),
    document.fonts.load('700 32px "YarcInter"', "HamburgefonstivéŁ₹0123456789"),
  ]);
  await document.fonts.ready;
  if (faces.some((group) => group.length === 0 || group.some((face) => face.status !== "loaded"))) throw new Error("Campaign font readiness failed.");
}
export function fontFallbackWarnings(text: string) {
  const unknown = [...new Set([...text].map((character) => character.codePointAt(0)!))].filter((cp) => cp > 32 && !manifest.assets.some((asset) => asset.coverageRanges.some(([start, end]) => cp >= start && cp <= end)) && ![0x200b, 0x200d, 0xfe0f].includes(cp));
  return unknown.length ? ["Some characters require system-font fallback. Review their appearance in the native exports on your device."] : [];
}

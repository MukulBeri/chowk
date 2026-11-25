"use client";
import { useEffect, useRef, useState } from "react";
import type { DesignSpecV3, Format } from "@/lib/design";
import { fitAndInspect } from "@/lib/design-engine/quality";
import { resolveLayout } from "@/lib/design-engine/layout";
import { prepareCampaignFonts, fontFallbackWarnings } from "@/lib/design-engine/fonts";

import { AdvancedPosterMarkup } from "./advanced-poster-markup";

export type LayoutReport = { issues: string[]; corrections: string[]; sizes: {role: string; pixels: number}[]; warnings?: string[] };
export function AdvancedPoster({ spec, format, onFit, onReport }: { spec: DesignSpecV3; format: Format; onFit?: (overflow: boolean) => void; onReport?: (report: LayoutReport) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [correction, setCorrection] = useState(0);
  const [status, setStatus] = useState({ ready: false, issues: [] as string[] });
  useEffect(() => {
    const root = ref.current; let cancelled = false;
    if (root) root.dataset.ready = "false";
    prepareCampaignFonts().then(() => {
      if (!root || cancelled) return;
      const issues = fitAndInspect(root);
      if (issues.length && correction < 2) { setCorrection(correction + 1); return; }
      setStatus({ ready: true, issues }); onFit?.(issues.length > 0);
      onReport?.({ issues, corrections: resolveLayout(spec, format, correction).corrections, warnings: fontFallbackWarnings([spec.campaign.headline, spec.campaign.supportingText, spec.campaign.cta].join("\n")), sizes: Array.from(root.querySelectorAll<HTMLElement>("[data-fit]")).map((element) => ({ role: element.dataset.role ?? "text", pixels: parseFloat(getComputedStyle(element).fontSize) })) });
    }).catch(() => { if (!cancelled) { setStatus({ ready: true, issues: ["FONT_UNAVAILABLE"] }); onFit?.(true); onReport?.({ issues: ["FONT_UNAVAILABLE"], corrections: [], sizes: [], warnings: ["An approved font failed loading or integrity verification. Retry when local assets are available."] }); } });
    return () => { cancelled = true; };
  }, [spec, format, correction, onFit, onReport]);
  return <AdvancedPosterMarkup spec={spec} format={format} correction={correction} status={status} rootRef={ref} />;
}

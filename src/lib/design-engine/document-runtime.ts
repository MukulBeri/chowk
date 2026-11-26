// Only repository-authored functions are serialized into the API HTML. No brief,
// model output or request parameter is ever interpreted as executable code.
export function measureCampaignDocument(
  fit: (root: HTMLElement) => string[],
  load: () => Promise<void>,
  fitLegacy: (root: HTMLElement) => boolean,
) {
  type Result = { state: "ready" | "failed"; formats: { id: string; issues: string[]; exportReady: boolean; corrections: string[] }[] };
  const host = window as unknown as { yarcCampaignReady: Promise<Result>; yarcCampaignQuality?: Result };
  const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-format]"));
  const finish = (formats: Result["formats"]): Result => {
    const state = formats.every(format => format.exportReady) ? "ready" : "failed";
    document.documentElement.dataset.renderState = state;
    const message = document.getElementById("campaign-status");
    if (message) message.textContent = state === "ready" ? "Browser font and geometry checks complete. Review facts and design before publication." : "Export refused for affected formats. Review the reported issues; no supplied copy was removed.";
    const result: Result = { state, formats }; host.yarcCampaignQuality = result; return result;
  };
  host.yarcCampaignReady = (async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const resources = async () => {
        await load();
        await Promise.all(Array.from(document.querySelectorAll<HTMLElement>("[data-raster-layer]")).map(async layer => {
          const url=getComputedStyle(layer).backgroundImage.slice(4,-1).replace(/^["']|["']$/g,"");
          if(!/^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(url))throw Error("Untrusted raster resource");
          const image=new Image();image.src=url;await image.decode();
        }));
      };
      await Promise.race([resources(), new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error("resource-timeout")), 10000); })]);
    } catch {
      const issue=document.querySelector("[data-raster-layer]")?"RESOURCE_UNAVAILABLE":"FONT_UNAVAILABLE";
      return finish(sections.map(section => {
        const root = section.querySelector<HTMLElement>("[data-poster]")!;
        root.dataset.ready = "true"; root.dataset.overflow = "true"; root.dataset.exportReady = "false"; root.dataset.quality = JSON.stringify([issue]);
        return { id: section.dataset.format!, issues: [issue], corrections: [], exportReady: false };
      }));
    } finally { if (timer) clearTimeout(timer); }
    return finish(sections.map(section => {
      let root = section.querySelector<HTMLElement>("[data-poster]")!, issues: string[] = [];
      try {
        for (let step = 0; step < (section.dataset.version === "3" ? 3 : 1); step++) {
          if (step) {
            const alternative = section.querySelector<HTMLTemplateElement>(`template[data-step="${step}"]`)!;
            const replacement = alternative.content.firstElementChild!.cloneNode(true) as HTMLElement;
            root.replaceWith(replacement); root = replacement;
          }
          issues = section.dataset.version === "3" ? fit(root) : fitLegacy(root) ? ["TEXT_OVERFLOW"] : [];
          if (!issues.length) break;
        }
      } catch { issues = ["MEASUREMENT_FAILED"]; }
      root.dataset.ready = "true"; root.dataset.overflow = String(issues.length > 0); root.dataset.quality = JSON.stringify(issues); root.dataset.exportReady = String(!issues.length);
      // Alternatives are inert and never registered as canonical artboards.
      section.querySelectorAll("template").forEach(template => template.remove());
      return { id: section.dataset.format!, issues, corrections: JSON.parse(root.dataset.corrections ?? "[]") as string[], exportReady: !issues.length };
    }));
  })();
}

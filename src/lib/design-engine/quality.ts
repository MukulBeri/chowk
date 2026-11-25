export type QualityIssue = "TEXT_OVERFLOW" | "OUT_OF_BOUNDS" | "TEXT_OVERLAP" | "DECOR_OVER_TEXT" | "MIN_FONT" | "LOW_CONTRAST";
function luminance(colour: string) {
  const values = (colour.match(/[\d.]+/g) ?? []).slice(0, 3).map((channel) => Number(channel) / 255).map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
}
export function fitAndInspect(root: HTMLElement): QualityIssue[] {
  const issues = new Set<QualityIssue>();
  const fields = Array.from(root.querySelectorAll<HTMLElement>("[data-fit]"));
  for (const element of fields) {
    let low = Number(element.dataset.min), high = Number(element.dataset.max);
    const fits = () => element.scrollHeight <= element.clientHeight + 1 && element.scrollWidth <= element.clientWidth + 1;
    element.style.fontSize = `${low}px`;
    if (!fits()) { issues.add("TEXT_OVERFLOW"); continue; }
    for (let step = 0; step < 12 && high - low > .5; step++) {
      const mid = (low + high) / 2;
      element.style.fontSize = `${mid}px`;
      if (fits()) low = mid; else high = mid;
    }
    element.style.fontSize = `${Math.floor(low)}px`;
    if (!fits()) issues.add("TEXT_OVERFLOW");
    if (parseFloat(getComputedStyle(element).fontSize) < Number(element.dataset.min)) issues.add("MIN_FONT");
    let background: HTMLElement | null = element;
    while (background && getComputedStyle(background).backgroundColor === "rgba(0, 0, 0, 0)") background = background.parentElement;
    if (background) {
      const foreground = luminance(getComputedStyle(element).color), back = luminance(getComputedStyle(background).backgroundColor);
      if ((Math.max(foreground, back) + .05) / (Math.min(foreground, back) + .05) < 4.5) issues.add("LOW_CONTRAST");
    }
  }
  const canvas = root.getBoundingClientRect();
  const content = fields.filter((element) => element.textContent?.trim());
  const art = root.querySelector<HTMLElement>("[data-hero]");
  const overlaps = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  for (let i = 0; i < content.length; i++) {
    const rect = content[i].getBoundingClientRect();
    if (rect.left < canvas.left - 1 || rect.right > canvas.right + 1 || rect.top < canvas.top - 1 || rect.bottom > canvas.bottom + 1) issues.add("OUT_OF_BOUNDS");
    if (art && overlaps(rect, art.getBoundingClientRect())) issues.add("DECOR_OVER_TEXT");
    for (let j = i + 1; j < content.length; j++) if (overlaps(rect, content[j].getBoundingClientRect())) issues.add("TEXT_OVERLAP");
  }
  // Check measured information siblings as well as their fitted container.
  // Decorative background/frame bleed is intentionally outside text siblings;
  // a hero remains obstructive regardless of z-index or pointer-events.
  const groups=Array.from(root.querySelectorAll<HTMLElement>("[data-copy-group]"));
  for(let i=0;i<groups.length;i++){
    const group=groups[i], box=group.getBoundingClientRect(), parent=group.parentElement!.getBoundingClientRect();
    if(group.scrollHeight>group.clientHeight+1||group.scrollWidth>group.clientWidth+1)issues.add("TEXT_OVERFLOW");
    if(box.left<parent.left-1||box.right>parent.right+1||box.top<parent.top-1||box.bottom>parent.bottom+1)issues.add("OUT_OF_BOUNDS");
    if(parseFloat(getComputedStyle(group).fontSize)<Number(group.parentElement!.dataset.min))issues.add("MIN_FONT");
    for(let j=i+1;j<groups.length;j++)if(overlaps(box,groups[j].getBoundingClientRect()))issues.add("TEXT_OVERLAP");
  }
  return [...issues];
}

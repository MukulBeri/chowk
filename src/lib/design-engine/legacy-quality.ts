export function fitLegacyText(root: HTMLElement) {
  let overflow = false;
  root.querySelectorAll<HTMLElement>("[data-fit]").forEach((element) => {
    let low = Number(element.dataset.min ?? 22);
    let high = Number(element.dataset.max ?? 150);
    const fits = () => element.scrollHeight <= element.clientHeight + 1 && element.scrollWidth <= element.clientWidth + 1;
    element.style.fontSize = `${low}px`;
    if (!fits()) { overflow = true; return; }
    while (high - low > 0.5) {
      const mid = (high + low) / 2;
      element.style.fontSize = `${mid}px`;
      if (fits()) low = mid; else high = mid;
    }
    element.style.fontSize = `${Math.floor(low)}px`;
  });
  return overflow;
}

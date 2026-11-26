// Diagnostics only. Empty regions are not automatically bad art; illustration
// bounds are not object detection. This never waives measured fit failures.
export function layoutSignals(root:HTMLElement){
  const canvas=root.getBoundingClientRect(),area=canvas.width*canvas.height;
  let textArea=0;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null,count=0;
  while((node=walker.nextNode())&&count++<1000){if(!node.textContent?.trim()||!node.parentElement?.closest('[data-fit]'))continue;const range=document.createRange();range.selectNodeContents(node);for(const r of range.getClientRects())textArea+=Math.max(0,Math.min(canvas.right,r.right)-Math.max(canvas.left,r.left))*Math.max(0,Math.min(canvas.bottom,r.bottom)-Math.max(canvas.top,r.top));}
  const art=root.querySelector<HTMLElement>('[data-hero]')?.getBoundingClientRect(),artArea=art?Math.max(0,Math.min(canvas.right,art.right)-Math.max(canvas.left,art.left))*Math.max(0,Math.min(canvas.bottom,art.bottom)-Math.max(canvas.top,art.top)):0;
  const estimatedUnusedFraction=area?1-Math.min(1,(textArea+artArea)/area):null;
  return {estimatedUnusedFraction,textBoundsFraction:area?textArea/area:null,artBoundsFraction:area?artArea/area:null,interpretation:'Text line and illustration bounding areas only; no artistic score, crop-object guarantee or export gate.',notes:estimatedUnusedFraction!==null&&estimatedUnusedFraction>.72?['Large empty-region signal: review whether whitespace supports the concept.']:[]};
}

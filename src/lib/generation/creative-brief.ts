import type { GenerationRequest } from "./contracts";
import { publicFactSchema, type PublicFact } from "./fact-ledger";
import { interpretBrief } from "./brief";

export type CreativeBrief = ReturnType<typeof interpretCreativeBrief>;
const tidy = (s: string) => s.replace(/\s+/g, " ").trim();
export const cleanTask = (s: string) => s.replace(/^(?:please\s+)?(?:(?:create|design|make|write|develop)(?: me)?\s+(?:an?\s+)?(?:launch |awareness |promotional )?(?:campaign|poster|announcement)\s+(?:for|about|to)|(?:launch |awareness |promotional )?campaign\s+(?:for|about|to)|(?:encourage|invite|ask) (?:people|students|neighbors|everyone) to|(?:promote|announce|introduce|present|unveil)\s+(?:the\s+)?(?:launch of\s+)?)\s*/i, "").trim();
// Closed input-field grammar: plural prices/dates are metadata; physical items
// (chairs, certificates, bags) and actual product colours/materials are not.
const field = "(?:(?:business|organization|organisation|product|campaign) names?|names?|brands?|(?:launch |event )?dates?|(?:event )?times?|prices?|pricing|venues?|locations?|schedules?|statistics|dimensions|registration (?:links?|channels?)|contact details)";
const fields = `${field}(?:(?:,\\s*(?:(?:and|or)\\s+)?|\\s+(?:and|or)\\s+)${field})*`;
const missing = new RegExp(`^(?:No (?:specific )?${fields} (?:has|have) been (?:supplied|provided)|${fields} (?:(?:is|are) not (?:supplied|provided|specified)|(?:has|have) not been (?:supplied|provided))|(?:I|we) (?:have not|haven't) (?:supplied|provided) ${fields})(?: yet)?[.!?]?$`, "i");
const instruction = /^(?:please\s+)?(?:do not|don't|never) (?:invent|assume|make up|generate)\b|^(?:please\s+)?(?:do not|don't|never) (?:add|include|mention|claim) (?:any |new |additional |unsupported )?(?:offers?|discounts?|sponsors?|statistics|logistics|claims?|facts?|dates?|prices?)\b|^(?:target audience|audience|tone|style|aesthetic|visual preference|creative direction)\s*:/i;
// A style action requires a design-role noun, not merely an adjective such as
// premium. "Use a premium pen holder" and "Do not include nuts" stay public.
const styleDirection = /^(?:please\s+)?(?:aim for|use|prefer|keep|avoid|make it)\b[^.!?]*\b(?:aesthetic|style|tone|mood|typography|fonts?|palette|layout|composition|illustrations?|graphics)\b[^.!?]*[.!?]?$/i;
const toneOnly = /^(?:(?:warm|youthful|affordable|premium|refined|understated|playful|energetic|bold|minimal|restrained|professional|elegant|friendly|serious|welcoming|luxurious)(?:\s*[,/]\s*|\s+and\s+|\s+|[.!]?))+$/i;
const noArt = /^(?:please )?(?:no (?:art|illustration|illustrations|graphics)(?: (?:please|requested))?|(?:without|do not use|don't use|avoid) (?:any )?(?:art|illustrations?|graphics)|(?:use )?(?:only )?(?:typography|type|text)[- ]only(?: design)?|use (?:only )?(?:typography|text))(?: please)?[.!]?$/i;
const unsafe = /<\/?(?:script|iframe|style)\b|javascript:|\b(?:ignore previous instructions|system prompt)\b/i;
const subjectless = /^(?:something|anything|surprise me|make anything|a poster|an announcement|help me|something (?:nice|amazing|cool)|not sure yet)[.!]?$/i;

// Recognize explicit naming and apposition, never manufacture a campaign name.
// Retain the complete factual clause and original fact ID in the ledger, so
// historical plans and exact source relationships remain compatible.
export function subjectIdentity(subject: string) {
  const named = subject.match(/\b(?:called|named)\s+["“]?(.+?)["”]?[.!]?$/i);
  if (named) return { name: named[1], descriptor: subject.slice(0, named.index).trim() };
  const apposition = subject.match(/^["“]?([^,]+?)["”]?,\s+(?:an?|the)\s+(.+?)[.!]?$/);
  if (apposition && apposition[1].length <= 80 && /\p{Lu}/u.test(apposition[1]) && apposition[1].split(/\s+/).every(word => /^(?:[\p{Lu}\d][\p{L}\d'’&-]*|to|and|of|the|for|in|on|&)$/u.test(word))) return { name: apposition[1], descriptor: apposition[2] };
  return { name: "", descriptor: subject };
}

// A deliberately bounded English interpreter, not an LLM or a truth engine.
// Classify complete clauses; never remove words from a negative public fact.
export function interpretCreativeBrief(request: GenerationRequest) {
  const facts: PublicFact[] = [], directions: string[] = [], missingInformation: string[] = [], ambiguities: string[] = [];
  let subject = "", audience = "", tone = "", illustration = true;
  for (const field of ["topic", "details"] as const) {
    const input = request[field]; let cursor = 0;
    for (const raw of input.split(/(?<=[.!?;])\s+|\n+/).filter(s => s.trim())) {
      const start = input.indexOf(raw, cursor), end = start + raw.length; cursor = end;
      const clause = raw.trim(), labelled = clause.match(/^(?:headline|supporting (?:copy|text)|public copy):\s*(.+)$/i);
      if (!labelled) {
        const existing = interpretBrief({ ...request, topic: clause, details: "" });
        if (missing.test(clause) || existing.missing.length) { missingInformation.push(clause); continue; }
        if (noArt.test(clause)) { illustration = false; directions.push(clause); continue; }
        if (instruction.test(clause) || styleDirection.test(clause) || toneOnly.test(clause) || existing.directions.length || unsafe.test(clause) || subjectless.test(clause)) {
          directions.push(clause);
          if (/^(?:target audience|audience):/i.test(clause)) audience = clause.replace(/^[^:]+:\s*/, "").replace(/[.!]$/, "");
          if (/^(?:tone|style|aesthetic|creative direction):|^(?:aim for|use|prefer|keep)\b/i.test(clause) || toneOnly.test(clause)) tone = clause.replace(/^[^:]+:\s*/, "");
          if (unsafe.test(clause)) ambiguities.push("Executable or instruction-like input was treated as untrusted planning data.");
          continue;
        }
      }
      let publicText = tidy(labelled?.[1] ?? cleanTask(clause));
      if (!labelled) {
        const mood = publicText.match(/^(.*?)\s+with an? (.+?) mood[.!]?$/i);
        if (mood && toneOnly.test(mood[2])) { publicText = mood[1] + "."; tone = mood[2]; directions.push(`Tone: ${mood[2]}`); }
        if (field === "topic" && publicText.length <= 120 && !/\b(no|not|never|without|cancelled|canceled)\b/i.test(publicText)) publicText = publicText.replace(/^an?\s+/i, "").replace(/[.!]$/, "");
      }
      if (!publicText) continue;
      const logisticalOnly = /^(?:venue|location|address|entry|price|fee|registration|register|date|time|capacity)\s*(?::|₹|\$|is\b)|^\d|^[₹$]|^https?:\/\//i.test(publicText);
      if (!subject && (labelled || !logisticalOnly)) subject = publicText;
      const named = field === "topic" && !labelled ? publicText.match(/\b(?:called|named)\s+["“]?(.+?)["”]?[.!]?$/i) : null;
      if (named && named.index !== undefined) {
        const name = named[1].replace(/[.!]$/, ""), descriptor = publicText.slice(0, named.index).replace(/^an?\s+/i, "").trim();
        const nameStart = start + raw.indexOf(name);
        if (descriptor && nameStart > start) {
          facts.push(publicFactSchema.parse({ id: `f-${field}-${start}`, text: descriptor, source: { field, start, end: nameStart } }));
          facts.push(publicFactSchema.parse({ id: `f-${field}-${nameStart}`, text: name, source: { field, start: nameStart, end: nameStart + name.length } }));
          continue;
        }
      }
      facts.push(publicFactSchema.parse({ id: `f-${field}-${start}`, text: publicText, source: { field, start, end } }));
    }
  }
  if (facts.length > 40) throw new Error("Brief has too many factual clauses; combine related information before generating.");
  const locations = facts.filter(f => /^(?:venue|location)\s*:/i.test(f.text));
  if (new Set(locations.map(f => f.text.toLowerCase())).size > 1) ambiguities.push("Multiple location declarations were supplied; all are retained. Confirm the current location before publishing.");
  const publicText = facts.map(f => f.text).join("\n");
  const objective = /\b(launch|opening|introduce|introducing|unveil|new)\b/i.test(publicText + request.topic) ? "launch" : /\b(reduce|awareness|reuse|protect|conserve)\b/i.test(publicText) ? "awareness" : /\b(workshop|gathering|concert|festival|event|café|cafe|club|exhibition|session|class)\b/i.test(publicText) ? "invite" : "announce";
  // Freeze the application-owned ledger before any creative/provider work.
  for (const fact of facts) { Object.freeze(fact.source); Object.freeze(fact); }
  return { subject, objective, facts: Object.freeze(facts), publicText, audience, tone, directions, missingInformation, ambiguities, illustration };
}

export function creativeCopyLeaks(request: GenerationRequest, copy: string) {
  const parsed = interpretCreativeBrief({ ...request, topic: copy, details: "" });
  const explicit = interpretBrief(request).explicitCopy.map(tidy);
  return [...parsed.directions, ...parsed.missingInformation].some(s => !explicit.includes(tidy(s)));
}

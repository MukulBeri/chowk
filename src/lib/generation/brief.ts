import type { z } from "zod";
import type { interpretationSchema, GenerationRequest } from "./contracts";

export class IncompleteBriefError extends Error {
  constructor(public readonly interpretation: z.infer<typeof interpretationSchema>) {
    super("Tell us what you are announcing or promoting before generating a campaign. Your previous campaign is preserved.");
    this.name = "IncompleteBriefError";
  }
}

// Recognize statements about the brief, not every sentence containing a negative.
// In particular, "No entry fee", "No chairs have been supplied" and an
// unconfirmed venue are public facts, not missing-input declarations.
const field = "(?:business name|organization name|organisation name|name|brand|bottle design|feature list|special product characteristics|launch date|event date|event time|date|time|price|pricing|schedule|location|venue|address|contact|fee|statistics|what|when|where)";
const fields = `${field}(?:(?:,\\s*(?:(?:and|or)\\s+)?|\\s+(?:and|or)\\s+)${field})*`;
const missingDeclaration = new RegExp(`^(?:No (?:specific )?${fields} (?:has|have) been (?:provided|supplied)|${fields} (?:has|have) not been (?:provided|supplied)|(?:I|we) (?:have not|haven't) (?:provided|supplied) ${fields})(?: yet)?[.!?]?$`, "i");
// Explicit metadata shorthand from the owner corpus, restricted to input fields.
// This does not match public negatives such as "No certificates" or "No entry fee".
const suppliedMissing = new RegExp(`^No supplied ${fields}[.!?]?$`, "i");
const planningDirection = /^(?:please\s+)?(?:do not (?:invent|assume|make up) (?:(?:any|new|the|missing|event|business|product)\s+)*(?:logistics|facts|details|names?|dates?|times?|prices?|locations?|venues?)(?:\s+(?:and|or)\s+(?:facts|details|names?|dates?|times?|prices?|locations?|venues?))*|(?:use|keep) (?:bold|large|small|minimal|simple|expressive) (?:typography|type|fonts?|colou?rs?|layout|composition))[.!?]?$/i;
const emptyRequest = /^(?:(?:please\s+)?(?:help me |I (?:need|want) to )?announce (?:something|an? (?:event|announcement))|(?:please\s+)?(?:create|make|design)(?: me)? (?:a |an? )?(?:poster|campaign|announcement)|I (?:need|want) (?:a |an? )?(?:poster|campaign|announcement))[.!?]?$/i;
const normalizedClause = (text: string) => text.replace(/\s+/g, " ").trim();
const isMissing = (text: string) => missingDeclaration.test(normalizedClause(text)) || suppliedMissing.test(normalizedClause(text));

export function interpretBrief(request: GenerationRequest) {
  const content: string[] = [], missing: string[] = [], directions: string[] = [], explicitCopy: string[] = [];
  for (const text of [request.topic, request.details]) {
    // Semicolons deliberately stay inside factual copy (e.g. venue + URL).
    for (const raw of text.split(/(?<=[.!?])\s+/).flatMap(part => isMissing(part) ? [part] : part.split(/\n/)).map((part) => part.trim()).filter(Boolean)) {
      // An explicit copy label makes otherwise ambiguous wording intentional.
      const labelled = raw.match(/^(?:headline|supporting (?:copy|text)|public copy):\s*(.+)$/i);
      if (labelled) { content.push(labelled[1]); explicitCopy.push(labelled[1]); continue; }
      // Split mixed brief declarations from facts without broadly deleting words.
      const clauses = raw.split(/;\s*/);
      if (clauses.length > 1 && clauses.some((part) => isMissing(part) || planningDirection.test(part))) {
        for (const clause of clauses) classify(clause);
      } else classify(raw);
    }
  }
  function classify(raw: string) {
    if (isMissing(raw)) missing.push(raw);
    else if (planningDirection.test(raw) || emptyRequest.test(raw)) directions.push(raw);
    else {
      const subject = raw.replace(/^(?:(?:please\s+)?(?:create|make|design) (?:a |an? )?(?:poster|campaign|announcement) (?:for|about)|(?:please\s+)?(?:help me )?announce)\s+/i, "");
      content.push(subject);
    }
  }
  return { content, missing, directions, explicitCopy };
}

// Share the same bounded grammar with model validation. Reject a leaking plan
// rather than silently deleting its text. Only an input-side copy label can
// authorize a declaration as public copy; a model-authored label cannot do so.
export function hasPlanningCopy(request: GenerationRequest, copy: string) {
  const explicit = new Set(interpretBrief(request).explicitCopy.flatMap(text => text.split(/;\s*/)).map(text => text.toLowerCase().replace(/\s+/g, " ").trim()));
  return copy.split(/(?<=[.!?])\s+|;\s*/).flatMap(part => [part, ...part.split(/\n/)]).some(part => {
    const clause = normalizedClause(part).replace(/^(?:headline|supporting (?:copy|text)|public copy):\s*/i, "");
    return (isMissing(clause) || planningDirection.test(clause) || emptyRequest.test(clause))
      && !explicit.has(clause.toLowerCase().replace(/\s+/g, " ").trim());
  });
}

export function boundedNotes(notes: string[], limit = 5) {
  const unique = [...new Set(notes)];
  const selected = unique.length > limit ? [...unique.slice(0, limit - 1), `${unique.length - limit + 1} additional brief notes; review the original input.`] : unique;
  return selected.map((note) => note.length > 180 ? `${note.slice(0, 177)}...` : note);
}

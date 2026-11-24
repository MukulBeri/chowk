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
const field = "(?:business name|name|launch date|date|time|price|pricing|schedule|location|venue|address|contact|special product characteristics|what|when|where)";
const fields = `${field}(?:(?:,\\s*(?:(?:and|or)\\s+)?|\\s+(?:and|or)\\s+)${field})*`;
const missingDeclaration = new RegExp(`^(?:No (?:specific )?${fields} (?:has|have) been (?:provided|supplied)|${fields} (?:has|have) not been (?:provided|supplied)|(?:I|we) (?:have not|haven't) (?:provided|supplied) ${fields})(?: yet)?[.!?]?$`, "i");
const planningDirection = /^(?:please\s+)?(?:do not (?:invent|assume|make up) (?:(?:any|new|the|missing|event|business|product)\s+)*(?:logistics|facts|details|names?|dates?|times?|prices?|locations?|venues?)(?:\s+(?:and|or)\s+(?:facts|details|names?|dates?|times?|prices?|locations?|venues?))*|(?:use|keep) (?:bold|large|small|minimal|simple|expressive) (?:typography|type|fonts?|colou?rs?|layout|composition))[.!?]?$/i;
const emptyRequest = /^(?:(?:please\s+)?(?:help me |I (?:need|want) to )?announce (?:something|an? (?:event|announcement))|(?:please\s+)?(?:create|make|design)(?: me)? (?:a |an? )?(?:poster|campaign|announcement)|I (?:need|want) (?:a |an? )?(?:poster|campaign|announcement))[.!?]?$/i;

export function interpretBrief(request: GenerationRequest) {
  const content: string[] = [], missing: string[] = [], directions: string[] = [];
  for (const text of [request.topic, request.details]) {
    // Semicolons deliberately stay inside factual copy (e.g. venue + URL).
    for (const raw of text.split(/(?<=[.!?])\s+|\n/).map((part) => part.trim()).filter(Boolean)) {
      // An explicit copy label makes otherwise ambiguous wording intentional.
      const labelled = raw.match(/^(?:headline|supporting (?:copy|text)|public copy):\s*(.+)$/i);
      if (labelled) { content.push(labelled[1]); continue; }
      // Split mixed brief declarations from facts without broadly deleting words.
      const clauses = raw.split(/;\s*/);
      if (clauses.length > 1 && clauses.some((part) => missingDeclaration.test(part) || planningDirection.test(part))) {
        for (const clause of clauses) classify(clause);
      } else classify(raw);
    }
  }
  function classify(raw: string) {
    if (missingDeclaration.test(raw)) missing.push(raw);
    else if (planningDirection.test(raw) || emptyRequest.test(raw)) directions.push(raw);
    else {
      const subject = raw.replace(/^(?:(?:please\s+)?(?:create|make|design) (?:a |an? )?(?:poster|campaign|announcement) (?:for|about)|(?:please\s+)?(?:help me )?announce)\s+/i, "");
      content.push(subject);
    }
  }
  return { content, missing, directions };
}

export function boundedNotes(notes: string[], limit = 5) {
  const unique = [...new Set(notes)];
  const selected = unique.length > limit ? [...unique.slice(0, limit - 1), `${unique.length - limit + 1} additional brief notes; review the original input.`] : unique;
  return selected.map((note) => note.length > 180 ? `${note.slice(0, 177)}...` : note);
}

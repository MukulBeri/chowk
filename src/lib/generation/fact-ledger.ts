import { z } from "zod";

// Only public, supplied content. Source offsets refer to the original request;
// neither hidden instructions nor private provider responses enter this record.
export const publicFactSchema = z.strictObject({
  id: z.string().regex(/^f-(?:topic|details)-\d+$/),
  text: z.string().trim().min(1).max(1200),
  source: z.strictObject({ field: z.enum(["topic", "details"]), start: z.number().int().nonnegative(), end: z.number().int().positive() }),
});
export const creativeContentSchema = z.strictObject({
  version: z.literal(1), subject: z.string().min(1).max(1200),
  objective: z.enum(["launch", "invite", "awareness", "announce"]),
  facts: z.array(publicFactSchema).min(1).max(40),
  factIds: z.array(publicFactSchema.shape.id).min(1).max(40),
}).superRefine((value, ctx) => {
  const ids = value.facts.map(fact => fact.id);
  if (new Set(ids).size !== ids.length || new Set(value.factIds).size !== value.factIds.length || ids.length !== value.factIds.length || ids.some(id => !value.factIds.includes(id))) ctx.addIssue({ code: "custom", message: "Every public fact must be referenced exactly once.", path: ["factIds"] });
  if (value.facts.some(f => f.source.end <= f.source.start)) ctx.addIssue({ code: "custom", message: "Invalid source range.", path: ["facts"] });
});
export type PublicFact = z.infer<typeof publicFactSchema>;

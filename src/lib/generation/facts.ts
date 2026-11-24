// Conservative, deterministic factual-token guard. This is not a truth engine.
const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export function normalized(text: string) {
  return text.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}
export function factualTokens(text: string) {
  let remainder = normalized(text);
  const tokens: string[] = [];
  function extract(pattern: RegExp, canonical: (...args: string[]) => string) {
    remainder = remainder.replace(pattern, (...args: string[]) => {
      tokens.push(canonical(...args)); return " ";
    });
  }
  extract(/\b(?:https?:\/\/|www\.)[^\s<>"']+|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/g, (s) => "contact:" + s.replace(/[.,;!?]+$/, ""));
  extract(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/g, (_s, y, m, d) => `date:${+y}-${+m}-${+d}`);
  const monthNames = "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec";
  extract(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?[ \\/-]+(${monthNames})[ ,\\/-]+(20\\d{2})\\b`, "g"), (_s, d, m, y) => `date:${+y}-${months.indexOf(m.slice(0, 3)) + 1}-${+d}`);
  extract(new RegExp(`\\b(${monthNames})[ .]+(\\d{1,2})(?:st|nd|rd|th)?[, ]+(20\\d{2})\\b`, "g"), (_s, m, d, y) => `date:${+y}-${months.indexOf(m.slice(0, 3)) + 1}-${+d}`);
  // Ambiguous numeric dates are retained as complete tokens, not guessed US/India dates.
  extract(/\b\d{1,2}[\/-]\d{1,2}[\/-](?:20)?\d{2}\b/g, (s) => "numeric-date:" + s);
  extract(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/g, (_s, h, m, half) => `time:${(+h % 12) + (half === "pm" ? 12 : 0)}:${m || "00"}`);
  extract(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, (_s, h, m) => `time:${+h}:${m}`);
  extract(/(?:₹|\brs\b\.?\s*|\binr\s*)(\d[\d,]*(?:\.\d+)?)|(?:\b(\d[\d,]*(?:\.\d+)?)\s*(?:inr|rupees)\b)/g, (_s, a, b) => "inr:" + Number((a || b).replaceAll(",", "")));
  extract(/(?:\$|usd\s*)(\d[\d,]*(?:\.\d+)?)/g, (_s, n) => "usd:" + Number(n.replaceAll(",", "")));
  extract(/\b\+?\d[\d(). -]{7,}\d\b/g, (s) => "phone-or-id:" + s.replace(/[^\d]/g, ""));
  extract(/\b(?:ist|utc|gmt|pst|pdt|est|edt|cet|cest)\b/g, (s) => "timezone:" + s);
  extract(/\b(\d+(?:\.\d+)?)\s*(seats?|teams?|participants?|hours?|days?|gb|mb|kg|km|watts?)\b/g, (_s, n, unit) => `measure:${Number(n)}:${unit.replace(/s$/, "")}`);
  extract(/\b[a-z]+[-_]?[a-z]*\d[\w-]*\b|\b\d+(?:[.,]\d+)*(?:%|[a-z][\w-]*)?/g, (s) => "value:" + s.replace(/,(?=\d{3}\b)/g, ""));
  return [...new Set(tokens)].sort();
}

const claims = [
  /\b(?:free (?:entry|tickets?|admission|shipping|delivery|gifts?|chai|coffee)|for free)\b/g, /\b\d+\s*%\s*off\b/g, /\bdiscount(?:s|ed)?\b/g, /\bguaranteed?\b/g,
  /\b(?:best|cheapest|number one|no\.?\s*1)\b/g, /\b(?:limited seats|limited time|selling fast|certified|award[- ]winning|organic|clinically proven)\b/g,
  /\b(?:handmade|waterproof|sugar[- ]free|fresh(?:ly)? (?:brewed|brews?|ingredients|made)|guaranteed results)\b/g,
];
export function factualIssues(input: string, output: string, requirePreservation = true) {
  const supplied = factualTokens(input), generated = factualTokens(output);
  const issues: string[] = [];
  if (generated.some((token) => !supplied.includes(token))) issues.push("unsupported-factual-token");
  if (requirePreservation && supplied.some((token) => !generated.includes(token))) issues.push("missing-supplied-fact");
  const original = normalized(input), copy = normalized(output);
  for (const rule of claims) {
    const matches = [...copy.matchAll(rule)];
    if (matches.some((match) => !original.includes(match[0]))) issues.push("unsupported-promotional-claim");
  }
  if (/\bcoming soon\b/i.test(output) && !/\b(?:coming soon|upcoming|opening|will launch)\b/i.test(input)) issues.push("unsupported-timing-claim");
  if (/\b(?:your (?:brand|company|business) name|insert (?:date|name|text)|lorem ipsum|tbd|todo)\b|\[(?:date|time|location|name|price|insert[^\]]*)\]/i.test(output)) issues.push("placeholder-copy");
  if (/<\/?(?:script|iframe|style)\b|javascript:|\b(?:ignore previous instructions|system prompt)\b/i.test(output)) issues.push("instruction-or-code-leakage");
  // Quoted names and explicit at/venue/location labels are preserved verbatim.
  const named = [...input.matchAll(/[“"]([^”"\n]{2,80})[”"]|\b(?:venue|location|business name|product name)\s*:\s*([^\n;]{2,80})/gi)].map((m) => (m[1] || m[2]).trim());
  if (requirePreservation && named.some((value) => !copy.includes(normalized(value)))) issues.push("missing-named-fact");
  return [...new Set(issues)];
}

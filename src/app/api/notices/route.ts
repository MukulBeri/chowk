import { readFile } from "node:fs/promises";
import path from "node:path";
const documents = [
  ...["NOTICES.txt", "NOTICE_SUPPLEMENT.txt", "Tabler-MIT.txt"].map(file => ({ label: `docs/licenses/${file}`, location: path.join(process.cwd(), "docs", "licenses", file) })),
  ...["OFL-anton.txt", "OFL-inter.txt", "OFL-fredoka.txt"].map(file => ({ label: `public/fonts/${file}`, location: path.join(process.cwd(), "public", "fonts", file) })),
];
export async function GET() {
  try {
    const texts = await Promise.all(documents.map(async file => `${file.label}\n\n${await readFile(file.location, "utf8")}`));
    return new Response(texts.join("\n\n----------------------------------------\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "License notices are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

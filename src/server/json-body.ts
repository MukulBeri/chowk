export class JsonBodyError extends Error {
  constructor(public readonly status: 400 | 408 | 413 | 415, message: string) { super(message); }
}
export async function readJsonBody(request: Request, maximum: number, deadlineMs = 2000): Promise<unknown> {
  const type = request.headers.get("content-type")?.trim() ?? "";
  const jsonType = /^application\/json(?:\s*;\s*[!#$%&'*+.^_`|~0-9a-z-]+\s*=\s*(?:"[^"\r\n]*"|[!#$%&'*+.^_`|~0-9a-z-]+))*$/i;
  const charsets = [...type.matchAll(/;\s*charset\s*=\s*(?:"([^"]*)"|([^;\s]+))/gi)];
  if (!jsonType.test(type) || charsets.some(match => !/^utf-?8$/i.test(match[1] ?? match[2]))) throw new JsonBodyError(415, "Send application/json with UTF-8 encoding.");
  const reader = request.body?.getReader();
  if (!reader) throw new JsonBodyError(400, "A JSON body is required.");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const read = async () => {
      const chunks: Uint8Array[] = []; let bytes = 0;
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        bytes += value.byteLength;
        if (bytes > maximum) throw new JsonBodyError(413, `Body exceeds ${maximum} bytes.`);
        chunks.push(value);
      }
      let text: string;
      try { text = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)); }
      catch { throw new JsonBodyError(400, "Use valid UTF-8 JSON."); }
      try { return JSON.parse(text) as unknown; }
      catch { throw new JsonBodyError(400, "Invalid JSON."); }
    };
    return await Promise.race([read(), new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new JsonBodyError(408, "JSON body reading timed out.")), deadlineMs);
    })]);
  } catch (error) {
    void reader.cancel().catch(() => {});
    if (error instanceof JsonBodyError) throw error;
    throw new JsonBodyError(400, "The JSON body could not be read.");
  } finally { if (timer) clearTimeout(timer); }
}

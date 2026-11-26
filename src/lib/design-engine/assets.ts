import { z } from "zod";

// Private local editing only. No URL, provider body, executable SVG or asserted
// public-use licence is accepted. Small images keep four-format HTML bounded.
export const MAX_RASTER_BYTES = 160_000;
// Retain the verified browser-import policy; the approved larger layer budget
// benefits server-prepared imagery without changing those existing assertions.
export const LOCAL_IMPORT_TARGET_BYTES = 60_000;
export const MAX_SOURCE_BYTES = 8_000_000;
export function rasterHeader(bytes: Uint8Array, maximumBytes = MAX_RASTER_BYTES) {
  if(bytes.length<24||bytes.length>maximumBytes)throw Error("Raster byte bound");
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const ascii=(start:number,end:number)=>String.fromCharCode(...bytes.subarray(start,end));
  let width=0,height=0,mime:"image/png"|"image/jpeg";
  if(ascii(0,8)==="\x89PNG\r\n\x1a\n"){
    mime="image/png";if(ascii(12,16)!=="IHDR"||bytes.length<29||bytes[24]!==8||![0,2,4,6].includes(bytes[25])||bytes[28]!==0)throw Error("Unsupported PNG");
    width=v.getUint32(16);height=v.getUint32(20);let offset=8,ended=false;
    while(offset+12<=bytes.length){const length=v.getUint32(offset),kind=ascii(offset+4,offset+8);if(["acTL","fcTL","fdAT"].includes(kind))throw Error("Animated PNG is unsupported");if(length>maximumBytes||offset+12+length>bytes.length||["iCCP","zTXt"].includes(kind))throw Error("Unsupported PNG chunk");if(kind==="iTXt"){let key=offset+8;while(key<offset+8+length&&bytes[key])key++;if(key-offset-8>79||key+2>=offset+8+length||bytes[key+1]!==0||bytes[key+2]!==0)throw Error("Compressed metadata unsupported");}offset+=length+12;if(kind==="IEND"){if(length!==0||offset!==bytes.length)throw Error("Invalid PNG end");ended=true;break;}}
    if(!ended)throw Error("Incomplete PNG");
  }else if(bytes[0]===255&&bytes[1]===216&&bytes[bytes.length-2]===255&&bytes[bytes.length-1]===217){
    mime="image/jpeg";let offset=2;
    while(offset+4<bytes.length){if(bytes[offset++]!==255)throw Error("Invalid JPEG marker");while(bytes[offset]===255)offset++;const marker=bytes[offset++];if(marker===218||marker===217)break;const length=v.getUint16(offset);if(length<2||offset+length>bytes.length)throw Error("Invalid JPEG segment");if([192,193,194].includes(marker)){if(length<8||bytes[offset+2]!==8)throw Error("Unsupported JPEG frame");height=v.getUint16(offset+3);width=v.getUint16(offset+5);break;}offset+=length;}
  }else throw Error("Unsupported raster type");
  if(!width||!height||width>2048||height>2048||width*height>4_000_000)throw Error("Raster dimension bound");
  return {mime,width,height,bytes:bytes.length};
}
const cropSchema = z.strictObject({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), zoom: z.number().min(1).max(2), fit: z.enum(["contain", "cover"]) });
export const assetLayerSchema = z.strictObject({
  version: z.literal(1), id: z.string().regex(/^asset-[a-f0-9]{16}$/),
  kind: z.enum(["local-raster", "generated-raster"]), source: z.enum(["local-file", "meta"]), provider: z.enum(["meta"]).nullable(), model: z.literal("muse-image-1.0").nullable(),
  inputReferenceSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable().optional(),
  rights: z.literal("unverified"), usageScope: z.literal("private-experiment"),
  createdAt: z.iso.datetime(), revision: z.number().int().min(1).max(10000),
  sourceEditId: z.string().regex(/^asset-[a-f0-9]{16}$/).nullable(),
  parentSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/), mime: z.enum(["image/png", "image/jpeg"]),
  bytes: z.number().int().min(24).max(MAX_RASTER_BYTES),
  width: z.number().int().min(1).max(2048), height: z.number().int().min(1).max(2048),
  dataUrl: z.string().max(4*Math.ceil(MAX_RASTER_BYTES/3)+23).regex(/^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/),
  derivative: z.strictObject({method:z.enum(["browser-jpeg","server-sharp"]),quality:z.literal(.82).nullable(),opaque:z.boolean(),sourceSha256:z.string().regex(/^[a-f0-9]{64}$/),sourceBytes:z.number().int().positive().max(MAX_SOURCE_BYTES),sourceWidth:z.number().int().positive().max(2048),sourceHeight:z.number().int().positive().max(2048)}).optional(),
  crop: cropSchema,
  framing: z.enum(["panel", "edge-to-edge"]).optional(),
  placements: z.partialRecord(z.enum(["instagram-portrait", "instagram-square", "youtube-thumbnail", "linkedin-landscape"]), cropSchema).optional(),
}).superRefine((asset, ctx) => {
  if (asset.kind === "generated-raster" ? !(asset.source === "meta" && asset.provider === "meta" && asset.model === "muse-image-1.0") : !(asset.source === "local-file" && asset.provider === null && asset.model === null)) ctx.addIssue({ code:"custom",message:"Inconsistent asset origin.",path:["source"] });
  try {
    const raw=Uint8Array.from(atob(asset.dataUrl.split(",")[1]),c=>c.charCodeAt(0)),header=rasterHeader(raw);
    if(header.mime!==asset.mime||!asset.dataUrl.startsWith(`data:${header.mime};base64,`)||header.bytes!==asset.bytes||header.width!==asset.width||header.height!==asset.height||asset.id!==`asset-${asset.sha256.slice(0,16)}`||asset.kind==="generated-raster"&&asset.mime!=="image/png"&&asset.derivative?.method!=="server-sharp")throw Error();
  } catch { ctx.addIssue({ code: "custom", message: "Invalid or oversized static raster layer.", path: ["dataUrl"] }); }
});
export type AssetLayer = z.infer<typeof assetLayerSchema>;
export async function prepareRasterLayer(asset?: AssetLayer) {
  if (!asset) return;
  const parsed = assetLayerSchema.parse(asset), raw = Uint8Array.from(atob(parsed.dataUrl.split(",")[1]), c => c.charCodeAt(0));
  const sha = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",raw)), n=>n.toString(16).padStart(2,"0")).join("");
  if (sha !== parsed.sha256) throw Error("Raster integrity failure");
  const image = new Image(); image.src = parsed.dataUrl; await image.decode();
  if(image.naturalWidth !== parsed.width || image.naturalHeight !== parsed.height) throw Error("Raster decode failure");
}
export async function importRaster(file: File, previous?: AssetLayer): Promise<AssetLayer> {
  if (file.type !== "image/png" || file.size > MAX_SOURCE_BYTES) throw Error("Choose a static PNG up to 8 MB and 2048 × 2048 pixels.");
  let buffer = await file.arrayBuffer();const source=rasterHeader(new Uint8Array(buffer),MAX_SOURCE_BYTES);if(source.mime!=="image/png")throw Error("PNG source required");
  const digest=async(b:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",b)),n=>n.toString(16).padStart(2,"0")).join("");
  const sourceHash=await digest(buffer);
  const bitmap = await createImageBitmap(file);
  let derivative:AssetLayer["derivative"];
  try {
    if(bitmap.width!==source.width||bitmap.height!==source.height)throw Error("PNG decoded dimensions did not match");
    if(buffer.byteLength>LOCAL_IMPORT_TARGET_BYTES){
      let optimized:Blob|null=null;
      for(const edge of [1024,768,576]){const scale=Math.min(1,edge/Math.max(source.width,source.height)),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(source.width*scale));canvas.height=Math.max(1,Math.round(source.height*scale));const ctx=canvas.getContext("2d");if(!ctx)throw Error("Image optimization unavailable");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);optimized=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",.82));if(optimized&&optimized.size<=LOCAL_IMPORT_TARGET_BYTES)break;}
      if(!optimized||optimized.type!=="image/jpeg"||optimized.size>LOCAL_IMPORT_TARGET_BYTES)throw Error("Image cannot fit the offline budget");buffer=await optimized.arrayBuffer();derivative={method:"browser-jpeg",quality:.82,opaque:true,sourceSha256:sourceHash,sourceBytes:source.bytes,sourceWidth:source.width,sourceHeight:source.height};
    }
  } finally { bitmap.close(); }
  const header=rasterHeader(new Uint8Array(buffer)),hash=await digest(buffer),dataUrl=`data:${header.mime};base64,${btoa(Array.from(new Uint8Array(buffer),n=>String.fromCharCode(n)).join(""))}`;
  return assetLayerSchema.parse({version:1,id:`asset-${hash.slice(0,16)}`,kind:"local-raster",source:"local-file",provider:null,model:null,inputReferenceSha256:sourceHash,rights:"unverified",usageScope:"private-experiment",createdAt:new Date().toISOString(),revision:(previous?.revision??0)+1,sourceEditId:previous?.id??null,parentSha256:previous?.sha256??(derivative?sourceHash:null),sha256:hash,...header,dataUrl,crop:{x:50,y:50,zoom:1,fit:"contain"},...(derivative?{derivative}:{})});
}

// Native nodes keep inline backgrounds for PNG. Portable documents share each
// resource once instead of embedding the same base64 payload four/twelve times.
export function shareRasterResources(markup: string) {
  const resources = new Map<string,string>();
  const html = markup.replace(/background-image:\s*url\((?:&quot;|")?(data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=]+)(?:&quot;|")?\)/g, (_match, data:string) => {
    let id = resources.get(data); if (!id) { id = `--campaign-raster-${resources.size}`; resources.set(data,id); }
    return `background-image:var(${id})`;
  });
  return { html, css: `:root{${[...resources].map(([data,id])=>`${id}:url(${data})`).join(";")}}` };
}

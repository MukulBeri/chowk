// Container metadata only. Pixels, dimensions and fidelity thresholds do not change.
function chunk(kind:string,data:Uint8Array){const name=new TextEncoder().encode(kind),out=new Uint8Array(data.length+12),view=new DataView(out.buffer);view.setUint32(0,data.length);out.set(name,4);out.set(data,8);let crc=0xffffffff;for(const byte of out.subarray(4,data.length+8)){crc^=byte;for(let i=0;i<8;i++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}view.setUint32(data.length+8,(crc^0xffffffff)>>>0);return out;}
export function pngProvenance(bytes:Uint8Array,xmp?:string,provenance?:string){
 if(!xmp&&!provenance)return bytes;
 if(bytes.length<20||![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))throw Error('PNG metadata requires a valid PNG');
 const encode=new TextEncoder(),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let offset=8;
 while(offset+12<=bytes.length){const length=view.getUint32(offset);if(offset+12+length>bytes.length)throw Error('Invalid PNG chunk');if(String.fromCharCode(...bytes.subarray(offset+4,offset+8))==='IDAT')break;offset+=12+length;}
 if(offset+12>bytes.length)throw Error('PNG image data missing');
 // Place ancillary metadata before IDAT: PNG permits later chunks, but some
 // native metadata readers stop at the first image-data chunk.
 const parts:Uint8Array[]=[bytes.subarray(0,offset)];
 for(const [name,value] of [['XML:com.adobe.xmp',xmp],['Chowk:Provenance',provenance]])if(value){if(encode.encode(value).length>32000)throw Error('Export provenance exceeds its bound');parts.push(chunk('iTXt',encode.encode(name+'\0\0\0\0\0'+value)));}
 parts.push(bytes.subarray(offset));const result=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let cursor=0;for(const part of parts){result.set(part,cursor);cursor+=part.length;}return result;
}

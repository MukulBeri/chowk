import { inflateSync } from "node:zlib";
import { MAX_RASTER_BYTES, rasterHeader } from "../lib/design-engine/assets";

// Original bounded PNG inspection; no external asset/parser source reused.
export function inspectRaster(bytes: Buffer) {
  const metadata=rasterHeader(bytes);
  if(metadata.mime==="image/jpeg")return {...metadata,browserDecodeRequired:true};
  if(bytes.length < 45 || bytes.length > MAX_RASTER_BYTES || !bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error("Invalid PNG");
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),channels=({0:1,2:3,4:2,6:4} as Record<number,number>)[bytes[25]];
  if(!width||!height||width>2048||height>2048||width*height>4_000_000||bytes[24]!==8||!channels||bytes[26]!==0||bytes[27]!==0||bytes[28]!==0)throw Error("Unsupported PNG");
  let offset=8,ended=false,header=false;const data:Buffer[]=[];
  while(offset+12<=bytes.length){const size=bytes.readUInt32BE(offset);if(size>MAX_RASTER_BYTES||offset+12+size>bytes.length)throw Error("Invalid chunk");const kind=bytes.toString("ascii",offset+4,offset+8);if(["acTL","fcTL","fdAT"].includes(kind))throw Error("Animated PNG is unsupported");let crc=0xffffffff;for(const b of bytes.subarray(offset+4,offset+8+size)){crc^=b;for(let i=0;i<8;i++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}if(((crc^0xffffffff)>>>0)!==bytes.readUInt32BE(offset+8+size))throw Error("Invalid CRC");
    if(kind==="IHDR"){if(header||offset!==8||size!==13)throw Error("Invalid header");header=true;}
    if(kind==="IDAT")data.push(bytes.subarray(offset+8,offset+8+size));
    offset+=size+12;if(kind==="IEND"){if(size!==0||offset!==bytes.length)throw Error("Invalid end");ended=true;break;}
  }
  if(!header||!ended||!data.length)throw Error("Incomplete PNG");
  const expected=height*(1+width*channels),raw=inflateSync(Buffer.concat(data),{maxOutputLength:expected});if(raw.length!==expected)throw Error("Invalid pixel data");
  for(let row=0;row<height;row++)if(raw[row*(1+width*channels)]>4)throw Error("Invalid filter");
  return {width,height,bytes:bytes.length,mime:"image/png" as const};
}

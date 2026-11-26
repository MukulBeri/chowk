import type {Metadata} from "next";

// Owner-verified production origin. Reject stale overrides rather than silently
// publishing old-domain metadata. Future origin changes require owner review.
export const APPROVED_PRODUCTION_ORIGIN="https://chowk-studio.vercel.app";
export function productionOrigin(value=process.env.CHOWK_PRODUCTION_ORIGIN){
 if(!value?.trim())return APPROVED_PRODUCTION_ORIGIN;
 let url:URL;try{url=new URL(value);}catch{throw Error("CHOWK_PRODUCTION_ORIGIN must be an approved HTTPS origin.");}
 if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||url.pathname!=="/")throw Error("CHOWK_PRODUCTION_ORIGIN must be an approved HTTPS origin without credentials, query or path.");
 if(url.origin!==APPROVED_PRODUCTION_ORIGIN)throw Error("CHOWK_PRODUCTION_ORIGIN must match the approved HTTPS origin; remove or update the stale override.");
 return url.origin;
}
export function routeMetadata(path:"/"|"/create"|"/explore"|"/docs",title?:string):Metadata{
 const heading=title?`${title} · Chowk`:"Chowk — Put your idea on the wall.";
 return { ...(title?{title}:{}),alternates:{canonical:path},openGraph:{title:heading,description:"Turn an idea into a visual campaign. Choose your creative direction, refine the details and create artwork for multiple platforms.",type:"website",url:new URL(path,productionOrigin()).href,images:[{url:"/opengraph-image.png",width:1200,height:630,alt:"Chowk — Put your idea on the wall."}]},twitter:{card:"summary_large_image",title:heading,images:["/opengraph-image.png"]} };
}

import {z} from 'zod';
import type {AssetLayer} from '../design-engine/assets';
const capability=z.strictObject({source:z.enum(['meta','gemini','local','manual-import']),model:z.string().max(80).nullable(),accepted:z.boolean(),fallbackReason:z.string().max(80).nullable(),attemptedModel:z.string().max(80).nullable().optional()});
export const capabilitiesSchema=z.strictObject({version:z.literal(1),text:capability,image:capability,conceptualImage:z.boolean(),publication:z.enum(['private-review','user-review-required'])});
export type Capabilities=z.infer<typeof capabilitiesSchema>;
// Reset changes the image, not the current copy or its manual/AI history.
export function restoredImageCapabilities(current:Capabilities|undefined,original:Capabilities|undefined,asset:AssetLayer|undefined):Capabilities|undefined{
 if(!current&&!original)return undefined; // Historical specifications stay additive.
 const base=current??original!;
 const image:Capabilities['image']=!asset?{source:'local',model:null,accepted:false,fallbackReason:'reset-local-artwork'}:asset.source==='meta'?(original?.image.source==='meta'?original.image:{source:'meta',model:asset.model,accepted:true,fallbackReason:null}):{source:'manual-import',model:null,accepted:false,fallbackReason:'owner-imported'};
 return{...base,image,conceptualImage:asset?.source==='meta',publication:asset?.usageScope==='private-experiment'?'private-review':original?.publication??base.publication};
}

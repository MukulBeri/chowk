import {z} from "zod";
import type {DesignSpecV3,Format} from "../design";
import type {ResolvedLayout} from "./layout";
export const EDITABLE_ROLES=["kicker","headline","support","cta","art","anchor"] as const;
export type EditableRole=typeof EDITABLE_ROLES[number];
const change=z.strictObject({dx:z.number().min(-25).max(25).optional(),dy:z.number().min(-25).max(25).optional(),widthScale:z.number().min(.5).max(1.5).optional(),heightScale:z.number().min(.5).max(1.5).optional(),fontScale:z.number().min(.8).max(1.2).optional(),align:z.enum(["left","center","right"]).optional(),tracking:z.number().min(-3).max(6).optional(),lineHeight:z.number().min(1).max(1.6).optional(),layer:z.number().int().min(1).max(9).optional(),hidden:z.boolean().optional()});
const roles=z.partialRecord(z.enum(EDITABLE_ROLES),change).superRefine((v,ctx)=>{for(const [role,edit] of Object.entries(v))if(role!=="art"&&edit?.hidden)ctx.addIssue({code:"custom",message:"Public text layers cannot be hidden.",path:[role,"hidden"]});});
export const editingSchema=z.strictObject({version:z.literal(1),shared:roles,formats:z.partialRecord(z.enum(["instagram-portrait","instagram-square","youtube-thumbnail","linkedin-landscape"]),roles)});
export type ElementEdit=z.infer<typeof change>;
export type Editing=z.infer<typeof editingSchema>;
export function elementEdit(spec:DesignSpecV3,format:Format,role:EditableRole):ElementEdit{return {...spec.editing?.shared[role],...spec.editing?.formats[format.id]?.[role]};}
export function applyEditing(layout:ResolvedLayout,spec:DesignSpecV3,format:Format):ResolvedLayout{
 if(!spec.editing)return layout;
 const next={...layout,corrections:[...layout.corrections]},keys={kicker:"kicker",headline:"headline",support:"support",cta:"cta",art:"art",anchor:"anchor"} as const;
 for(const role of EDITABLE_ROLES){const rect=next[keys[role]],edit=elementEdit(spec,format,role);if(!rect||!Object.keys(edit).length)continue;
  if(role==="art"&&edit.hidden){delete next.art;continue;}
  const w=Math.min(format.width,Math.max(32,rect.w*(edit.widthScale??1))),h=Math.min(format.height,Math.max(24,rect.h*(edit.heightScale??1)));
  const x=Math.min(format.width-w,Math.max(0,rect.x+(edit.dx??0)/100*format.width)),y=Math.min(format.height-h,Math.max(0,rect.y+(edit.dy??0)/100*format.height));
  next[keys[role]]={x,y,w,h};
 }
 next.corrections.push("Manual element adjustments applied; positions and sizes stay within the native canvas. All text still requires measured fit and contrast checks.");return next;
}

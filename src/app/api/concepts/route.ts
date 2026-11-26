import { generationRequestSchema } from "@/lib/generation/contracts";
import { localConcepts } from "@/lib/generation/concepts";
import { IncompleteBriefError } from "@/lib/generation/brief";
import { JsonBodyError, readJsonBody } from "@/server/json-body";

// Explicit local exploration only. This route cannot construct any provider.
export async function POST(request:Request){
  const headers={"Cache-Control":"no-store","X-Campaign-Inference":"disabled"};
  try{
    const input=generationRequestSchema.safeParse(await readJsonBody(request,12288));
    if(!input.success||input.data.treatment!=="creative-led")return Response.json({error:"Choose Creative-led and enter a concrete brief."},{status:400,headers});
    return Response.json(localConcepts({...input.data,mode:"local"}),{headers});
  }catch(error){
    if(error instanceof JsonBodyError)return Response.json({error:error.message},{status:error.status,headers});
    if(error instanceof IncompleteBriefError)return Response.json({code:"brief-incomplete",error:error.message,interpretation:error.interpretation},{status:422,headers});
    return Response.json({error:"Concept exploration could not finish. Your current campaign is preserved."},{status:503,headers});
  }
}

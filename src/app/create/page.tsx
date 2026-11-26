import {routeMetadata} from "@/lib/site-metadata";
import { Studio } from "@/components/studio";
export const metadata = routeMetadata("/create","Creative studio");
export default function CreatePage() { const meta=process.env.CHOWK_AI_ENABLED==='true'&&process.env.CHOWK_AI_KILL_SWITCH!=='true';return <Studio inferenceEnabled={process.env.CHOWK_AI_KILL_SWITCH!=='true'&&(meta||process.env.GEMINI_ENABLED === "true")} metaEnabled={meta} />; }

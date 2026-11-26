import {routeMetadata} from "@/lib/site-metadata";
import { Studio } from "@/components/studio";
export const metadata = routeMetadata("/create","Creative studio");
export default function CreatePage() { return <Studio inferenceEnabled={process.env.GEMINI_ENABLED === "true"} />; }

import type { Metadata } from "next";
import { Studio } from "@/components/studio";
export const metadata: Metadata = { title: "Creative studio" };
export default function CreatePage() { return <Studio inferenceEnabled={process.env.GEMINI_ENABLED === "true"} />; }

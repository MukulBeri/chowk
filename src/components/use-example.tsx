"use client";
import { useRouter } from "next/navigation";
import { sendStudioDraft, type StudioDraft } from "@/lib/studio-handoff";
export function UseExample({ draft, children = "Try this brief ↗" }: { draft: StudioDraft; children?: React.ReactNode }) {
  const router = useRouter();
  return <button className="site-button" onClick={() => { sendStudioDraft(draft); router.push("/create"); }}>{children}</button>;
}

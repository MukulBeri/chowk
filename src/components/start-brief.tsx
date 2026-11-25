"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PRESETS, TASTES, type Taste } from "@/lib/design";
import { sendStudioDraft } from "@/lib/studio-handoff";
export function StartBrief() {
  const router = useRouter(), [topic, setTopic] = useState(""), [details, setDetails] = useState(""), [taste, setTaste] = useState<Taste>("bold-street"), [error, setError] = useState("");
  function start(e: FormEvent) { e.preventDefault(); try { sendStudioDraft({ topic, details, taste, treatment: "creative-led" }); router.push("/create"); } catch { setError("Add your idea and keep the combined brief within 2,200 characters."); } }
  return <form className="site-brief" onSubmit={start}><label htmlFor="start-topic">What are we promoting?</label><textarea id="start-topic" maxLength={1200} required rows={2} value={topic} onChange={e => setTopic(e.target.value)} placeholder="A workshop. A collection. A cause worth sharing." /><details><summary>Add facts or creative direction</summary><label htmlFor="start-details">Supporting details</label><textarea id="start-details" maxLength={1200} rows={3} value={details} onChange={e => setDetails(e.target.value)} placeholder="Names, dates, prices and anything we should know" /></details><fieldset><legend>Choose your starting taste</legend><div className="site-taste-choices">{TASTES.map(t => <label key={t} className={taste === t ? "is-selected" : ""}><input type="radio" name="start-taste" checked={taste === t} onChange={() => setTaste(t)} />{PRESETS[t].name}</label>)}</div></fieldset><div className="site-brief-actions"><button className="site-button site-primary" type="submit">Take it to the studio <span aria-hidden="true">↗</span></button><span>No account needed.<br />You choose when to generate.</span></div>{error && <p role="alert">{error}</p>}</form>;
}

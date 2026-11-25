import { PRESETS, TASTES, type Taste } from "@/lib/design";
import Image from "next/image";
import { GALLERY } from "@/lib/gallery";
const descriptions = { "bold-street": "Expressive / energetic", "minimal-swiss": "Precise / restrained", "festive-pop": "Playful / vibrant" };
export function TastePicker({ value, disabled, onChange }: {
    value: Taste;
    disabled: boolean;
    onChange: (taste: Taste) => void;
}) {
    return <fieldset className="taste-picker"><legend>Choose a taste</legend><div className="taste-options">{TASTES.map(taste => <label className={`taste-option ${value === taste ? "selected" : ""}`} key={taste}><input type="radio" name="draft-taste" value={taste} checked={value === taste} disabled={disabled} onChange={() => onChange(taste)} aria-label={PRESETS[taste].name}/><span className="taste-miniature taste-real" aria-hidden="true"><Image src={GALLERY.find(e => e.taste === taste)!.formats[1].src} width={64} height={64} alt="" unoptimized /></span><span className="taste-description"><strong>{PRESETS[taste].name}</strong><small>{descriptions[taste]}</small></span></label>)}</div></fieldset>;
}

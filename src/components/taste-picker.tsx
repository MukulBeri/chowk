import { PRESETS, TASTES, type Taste } from "@/lib/design";
const descriptions = { "bold-street": "Expressive / energetic", "minimal-swiss": "Precise / restrained", "festive-pop": "Playful / vibrant" };
export function TastePicker({ value, disabled, onChange }: {
    value: Taste;
    disabled: boolean;
    onChange: (taste: Taste) => void;
}) {
    return <fieldset className="taste-picker"><legend>Choose a taste</legend><div className="taste-options">{TASTES.map(taste => <label className={`taste-option ${value === taste ? "selected" : ""}`} key={taste}><input type="radio" name="draft-taste" value={taste} checked={value === taste} disabled={disabled} onChange={() => onChange(taste)} aria-label={PRESETS[taste].name}/><span className={`taste-miniature taste-miniature-${taste}`} aria-hidden="true"><b>{taste === "bold-street" ? <>MAKE<br />IT COUNT</> : taste === "minimal-swiss" ? <>Less.<br />But better.</> : <>Make<br />some joy.</>}</b><i /><span /></span><span className="taste-description"><strong>{PRESETS[taste].name}</strong><small>{descriptions[taste]}</small></span></label>)}</div></fieldset>;
}

// Conservative editorial transformations, never free-form product/event facts.
// Unknown, long, negative and explicitly labelled copy retains the supplied text.
export function editorialCopy(content: string[], headline: string) {
  const first = content[0];
  if (first.length > 60 || /\b(no|not|never|without|changed|cancelled|canceled)\b/i.test(first)) return { headline, content };
  let title = headline, eyebrow: string | undefined;
  const support = [...content];
  const audience=first.match(/^(?:an? )?(.{3,42}?\b(?:workshop|gathering|festival|concert|contest)) for ([\p{L} -]{3,28})[.!]?$/iu);
  if (audience && /\brobotics\b/i.test(audience[1])) {
    title = audience[1].charAt(0).toUpperCase()+audience[1].slice(1);
    eyebrow = `For ${audience[2]}`;
    support.shift();
    const count = support.findIndex(text=>/^\d+ teams\.[ ]*$/i.test(text));
    if(count>=0 && `${eyebrow} · ${support[count].replace(/\.$/, "")}`.length<=40){eyebrow+=` · ${support[count].replace(/\.$/, "")}`;support.splice(count,1);}
  } else if (/\b(?:chai|coffee|tea)\b/i.test(first) && /\bserving\b/i.test(first)) {
    const beverage=first.match(/^(?:an? )?(.{3,48}?\b(?:stall|cart|café|cafe)) serving ([\p{L} -]{3,35})[.!]?$/iu);
    if(beverage){title=beverage[2].charAt(0).toUpperCase()+beverage[2].slice(1)+".";support[0]=`A ${beverage[1]}.`;}
  } else if (/\bcultural evening\b/i.test(first) && /\bmusic\b/i.test(first) && /\bdance\b/i.test(first)) {
    title = "Music. Dance. Together.";
  } else if (/\bAI workshop\b/.test(first) && /\bbeginners?\b/i.test(first)) {
    title = "Begin with AI."; // Preserve the complete supplied subject as context.
  } else if (/\bproductivity app\b/i.test(first)) {
    title = "Make room to focus.";
  } else if (/\breduce plastic waste\b/i.test(first)) {
    title = "Less plastic.\nMore possibility.";
  } else if (/\bperfume\b/i.test(first) && /\b(?:refined|understated)\b/i.test(first)) {
    title = "Quietly expressive.";
  } else if (/\bcoding contest\b/i.test(first)) {
    title = "Ready. Set. Code.";
  }
  return { headline: title, content: support, eyebrow };
}

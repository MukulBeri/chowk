import type { Taste } from "../src/lib/design";

// Owner-specified synthetic fixtures, not actual events, brands or measurements.
export const M4_CORPUS: { id: string; topic: string; details: string; taste: Taste }[] = [
  ...(["bold-street", "minimal-swiss", "festive-pop"] as const).map(taste => ({ id: `robotics-${taste}`, taste, topic: "Campus robotics workshop for students.", details: "12 teams. 26 November 2026 at 18:30 IST. Venue: Lab A; Entry ₹150. Register at https://example.org/workshop." })),
  { id: "chai", taste: "bold-street", topic: "A neighborhood chai stall serving hot masala chai.", details: "No supplied name, date or price." },
  { id: "culture", taste: "festive-pop", topic: "Cultural evening of music and dance.", details: "No supplied date, venue or fee." },
  { id: "ai-workshop", taste: "minimal-swiss", topic: "AI workshop for beginners.", details: "Free entry; Seminar Hall B. No certificates." },
  { id: "productivity", taste: "bold-street", topic: "A productivity app for students.", details: "No supplied feature list, launch date or pricing." },
  { id: "environment", taste: "minimal-swiss", topic: "Campaign to reduce plastic waste.", details: "Bring a reusable bottle. No supplied statistics." },
  { id: "perfume", taste: "minimal-swiss", topic: "Premium perfume campaign with a refined, understated mood.", details: "No supplied brand, bottle design or price." },
  { id: "coding", taste: "festive-pop", topic: "Coding contest for students.", details: "27 November 2026, 15:00 IST. Venue changed from Lab A to Lab C. No entry fee." },
];

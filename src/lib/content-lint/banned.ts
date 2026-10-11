// docs/CONTENT_STYLE.md section 3. Metaphorical-only words (landscape, navigate,
// journey) are flagged on every use: rephrase the rare literal one too.
const BANNED_PHRASES = [
  "delve",
  "delving",
  "tapestry",
  "landscape",
  "navigate",
  "navigating",
  "realm",
  "embark",
  "journey",
  "unlock",
  "unleash",
  "empower",
  "elevate",
  "leverage",
  "robust",
  "seamless",
  "seamlessly",
  "crucial",
  "pivotal",
  "paramount",
  "vital role",
  "plays a key role",
  "multifaceted",
  "holistic",
  "foster",
  "plethora",
  "myriad",
  "testament",
  "game-changer",
  "cutting-edge",
  "ever-evolving",
  "in today's fast-paced world",
  "in today's digital age",
  "in the modern era",
  "it's important to note",
  "it is worth noting",
  "it's no secret",
  "needless to say",
  "furthermore",
  "moreover",
  "in conclusion",
  "to sum up",
  "at the end of the day",
  "look no further",
  "rest assured",
  "dive into",
  "deep dive",
  "let's explore",
  "buckle up",
  "ultimate guide",
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const BANNED: { name: string; pattern: RegExp }[] = [
  ...BANNED_PHRASES.map((phrase) => ({
    name: phrase,
    pattern: new RegExp(`\\b${escape(phrase)}\\b`, "gi"),
  })),
  {
    name: "additionally (as sentence opener)",
    pattern: /(?:^|[.!?]\s+|^\s*[-*]\s+)additionally\b/gim,
  },
  {
    name: "whether you're X or Y",
    pattern: /\bwhether you(?:'re| are)\b[^.?!\n]*?\bor\b/gi,
  },
];

/** Allowed a limited number of times per article. */
export const CAPPED: { name: string; pattern: RegExp; max: number }[] = [
  {
    name: "not only X but also Y",
    pattern: /\bnot only\b[^.?!\n]*?\bbut also\b/gi,
    max: 1,
  },
  { name: "peace of mind", pattern: /\bpeace of mind\b/gi, max: 1 },
];

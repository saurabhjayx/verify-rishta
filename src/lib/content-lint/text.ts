/** Marks a citation (link or footnote ref) inside flattened paragraph text. */
export const CITE = "\u0001";

const ABBREVIATION = /\b(?:e\.g|i\.e|etc|vs|mr|mrs|ms|dr|rs|no|st|approx)\.$/i;

/** Splits prose into sentences. Good enough for our own English copy, not a general NLP splitter. */
export function splitSentences(text: string): string[] {
  const pieces = text.trim().split(/(?<=[.!?]["')\]\u0001]*)\s+/);
  const sentences: string[] = [];
  for (const piece of pieces) {
    const prev = sentences.at(-1);
    // Rejoin after abbreviations ("e.g. salary slips") and before lowercase continuations.
    if (
      prev !== undefined &&
      (ABBREVIATION.test(prev) || /^[a-z]/.test(piece))
    ) {
      sentences[sentences.length - 1] = `${prev} ${piece}`;
    } else if (piece) {
      sentences.push(piece);
    }
  }
  return sentences;
}

export const words = (text: string) =>
  text
    .replaceAll(CITE, "")
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w));

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .match(/[aeiouy]+/g);
  return Math.max(1, groups?.length ?? 0);
}

/** Flesch reading ease. Higher is easier; we target 55 to 70. */
export function fleschReadingEase(sentences: string[]): number {
  const all = sentences.flatMap(words);
  if (sentences.length === 0 || all.length === 0) return 100;
  const syllableCount = all.reduce((sum, w) => sum + syllables(w), 0);
  return (
    206.835 -
    1.015 * (all.length / sentences.length) -
    84.6 * (syllableCount / all.length)
  );
}

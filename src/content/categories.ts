// Topics (a.k.a. categories, clusters). URL shape: /<category-slug>/<article-slug>.
// Frontmatter `category` must match a slug or name here; anything else fails
// content:lint and the build. Adding a topic = adding one entry.
// `description` doubles as the topic page's meta description (120 to 160 chars).

export type Category = { slug: string; name: string; description: string };

export const CATEGORIES = [
  {
    slug: "marriage-verification-basics",
    name: "Marriage verification basics",
    description:
      "What marriage background verification is, what it checks, how families in India do it with consent, and what it cannot tell you.",
  },
  {
    slug: "matrimonial-fraud",
    name: "Matrimonial fraud",
    description:
      "Common types of matrimonial fraud in India, the red flags in a profile or biodata, and what to do if your family has already been cheated.",
  },
  {
    slug: "detective-vs-self-verification",
    name: "Detective vs self-verification",
    description:
      "An honest comparison of detective agencies and consent-based self-verification before marriage in India: cost, legality and limits.",
  },
  {
    slug: "for-parents",
    name: "For parents",
    description:
      "A practical guide for parents on checking a rishta respectfully, asking the other family for documents and talking about it without offence.",
  },
  {
    slug: "documents-and-records",
    name: "Documents and records",
    description:
      "Which documents prove identity, education, work and marital status in India, and how families can check them without breaking the law.",
  },
  {
    slug: "nri-marriages",
    name: "NRI marriages",
    description:
      "Marrying an NRI: what to verify before the wedding, which documents to ask for, and where Indian families can get official help abroad.",
  },
  {
    // Evergreen URL; only the display name carries the year.
    slug: "navratri",
    name: "Navratri 2026",
    description:
      "The meaning, stories and customs of Navratri: the nine forms of Maa Durga, fasting, festival colours and how the festival is celebrated across India.",
  },
  {
    slug: "milne-se-pehle",
    name: "Milne Se Pehle",
    description:
      "How Milne Se Pehle verification works and who it is for, explained plainly by the team that runs it. VerifyRishta is published by the same team.",
  },
] as const satisfies readonly Category[];

/** Accepts a slug or a name (case-insensitive), as written in frontmatter. */
export function findCategory(value: string): Category | undefined {
  const v = value.trim().toLowerCase();
  return CATEGORIES.find((c) => c.slug === v || c.name.toLowerCase() === v);
}

export const getCategory = (slug: string): Category | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

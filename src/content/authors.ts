// Authors and reviewers. Frontmatter `author` / `reviewer` must match a slug or
// name here (e.g. "Verify Rishta Editorial Team"); anything else fails the build.

export type Author = {
  slug: string;
  name: string;
  /** Organization for team bylines, Person for named people (JSON-LD @type). */
  kind: "Person" | "Organization";
  role: string;
  /** Plain paragraphs separated by a blank line. */
  bio: string;
  /** Path to a WebP in public/images/authors/, when we have one. */
  photo?: string;
  sameAs: string[];
  expertise: string[];
};

export const AUTHORS: Author[] = [
  {
    slug: "verify-rishta-editorial-team",
    name: "Verify Rishta Editorial Team",
    kind: "Organization",
    role: "Editorial team",
    bio: "The VerifyRishta editorial team writes and reviews guides on marriage background verification in India.",
    sameAs: [],
    expertise: ["Marriage background verification", "Matrimonial fraud"],
  },
];

/** Accepts a slug or a name (case-insensitive), as written in frontmatter. */
export function findAuthor(value: string): Author | undefined {
  const v = value.trim().toLowerCase();
  return AUTHORS.find((a) => a.slug === v || a.name.toLowerCase() === v);
}

export const getAuthor = (slug: string): Author | undefined =>
  AUTHORS.find((a) => a.slug === slug);

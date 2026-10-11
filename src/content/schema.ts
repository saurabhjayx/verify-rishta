import { z } from "zod";

/** Lowercase kebab-case, max 70 chars. */
export const slugSchema = z
  .string()
  .max(70)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be lowercase kebab-case");

// YAML turns an unquoted 2026-10-10 into a Date and a quoted one into a string; accept both.
const dateSchema = z.coerce.date();

const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  publisher: z.string().min(1),
  accessed: z.preprocess(
    (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
    z.iso.date(),
  ),
});

const faqSchema = z.object({ q: z.string().min(1), a: z.string().min(1) });

/**
 * Frontmatter of content/articles/<slug>.mdx. The first block mirrors the
 * owner's format; the rest is optional SEO / E-E-A-T metadata.
 */
export const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: slugSchema,
    description: z.string().min(120).max(160),
    publishedAt: dateSchema,
    updatedAt: dateSchema.optional(),
    author: z.string().min(1),
    category: z.string().min(1),
    draft: z.boolean().default(false),

    /** <title> tag when `title` is not 30 to 60 chars. */
    seoTitle: z.string().min(30).max(60).optional(),
    /** Card and RSS summary; defaults to `description`. */
    excerpt: z.string().min(1).optional(),
    /** Set only after a real review. Shown as "Last reviewed"; no fallback. */
    lastReviewedAt: dateSchema.optional(),
    reviewer: z.string().min(1).optional(),
    tags: z.array(slugSchema).default([]),
    sources: z.array(sourceSchema).default([]),
    faqs: z.array(faqSchema).default([]),
    /** The topic's main guide: served at /<category>. */
    pillar: z.boolean().default(false),
    noindex: z.boolean().default(false),
    heroImage: z
      .object({
        src: z.string().regex(/\.webp$/, "hero images must be WebP"),
        alt: z.string().min(1),
        width: z.int().positive(),
        height: z.int().positive(),
      })
      .optional(),
    lang: z.enum(["en-IN", "hi-IN"]).default("en-IN"),

    // Editorial only (briefs), never rendered.
    audience: z.enum(["parents", "bride-groom", "both"]).optional(),
    primaryQuery: z.string().optional(),
    secondaryQueries: z.array(z.string()).optional(),
  })
  .strict()
  .superRefine((fm, ctx) => {
    if (!fm.seoTitle && (fm.title.length < 30 || fm.title.length > 60)) {
      ctx.addIssue({
        code: "custom",
        path: ["seoTitle"],
        message: `title is ${fm.title.length} chars; add seoTitle (30 to 60 chars) for the <title> tag`,
      });
    }
  });

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Faq = z.infer<typeof faqSchema>;

import "server-only";
import { readdirSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { env } from "@/env";
import { compileArticle } from "@/lib/markdown/compile";
import type { TocEntry } from "@/lib/markdown/rehype-toc";
import { checkArticle } from "./article";
import type { Faq, Frontmatter, Source } from "./schema";

/** Everything a page needs about one article. Plain data: safe to cache. */
export type Post = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  category: string;
  author: string;
  reviewer?: string;
  publishedAt: Date;
  updatedAt: Date;
  /** Only when someone actually reviewed it; never derived from updatedAt. */
  lastReviewedAt?: Date;
  tags: string[];
  sources: Source[];
  faqs: Faq[];
  pillar: boolean;
  noindex: boolean;
  draft: boolean;
  heroImage?: Frontmatter["heroImage"];
  lang: Frontmatter["lang"];
  /** MDX source without frontmatter (for llms-full.txt). */
  body: string;
  code: string;
  toc: TocEntry[];
  wordCount: number;
  readingMinutes: number;
};

export const articlesDir = () => path.resolve(env.CONTENT_DIR, "articles");

const isDev = process.env.NODE_ENV === "development";
// Drafts show in `next dev` for previewing, never in production builds.
const includeDrafts = isDev;

/**
 * Dev only: names + mtimes of the article files. It is part of the cache key
 * below, so adding, editing or deleting an .mdx shows up on the next request
 * (article files are not code, so Next never invalidates the cache itself).
 * Sync on purpose: a few stat calls, and invisible to prerender IO tracking.
 * Production content only changes with a redeploy, so a constant key is enough.
 */
function contentVersion(): string {
  if (!isDev) return "build";
  try {
    const dir = articlesDir();
    return readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => `${f}:${statSync(path.join(dir, f)).mtimeMs}`)
      .join("|");
  } catch {
    return "missing";
  }
}

/**
 * Reads, validates and compiles every article once per content version.
 * Throws on any invalid file, so a bad article fails the build.
 */
async function loadPostsVersion(version: string): Promise<Post[]> {
  "use cache";
  void version; // only part of the cache key
  cacheLife("max");
  const dir = articlesDir();
  const files = (await readdir(dir).catch(() => [])).filter((f) =>
    f.endsWith(".mdx"),
  );

  const posts = await Promise.all(
    files.map(async (file): Promise<Post> => {
      const filePath = path.join(dir, file);
      const { article, problems } = checkArticle(
        await readFile(filePath, "utf8"),
        filePath,
      );
      if (!article) throw new Error(`${filePath}:\n  ${problems.join("\n  ")}`);
      const { frontmatter: fm, body, category, author, reviewer } = article;
      const compiled = await compileArticle(body, { slug: fm.slug });
      const updatedAt = fm.updatedAt ?? fm.publishedAt;
      return {
        slug: fm.slug,
        title: fm.title,
        seoTitle: fm.seoTitle ?? fm.title,
        description: fm.description,
        excerpt: fm.excerpt ?? fm.description,
        category: category.slug,
        author: author.slug,
        reviewer: reviewer?.slug,
        publishedAt: fm.publishedAt,
        updatedAt,
        lastReviewedAt: fm.lastReviewedAt,
        tags: fm.tags,
        sources: fm.sources,
        faqs: fm.faqs,
        pillar: fm.pillar,
        noindex: fm.noindex,
        draft: fm.draft,
        heroImage: fm.heroImage,
        lang: fm.lang,
        body,
        ...compiled,
      };
    }),
  );

  const seenPillar = new Map<string, string>();
  for (const post of posts) {
    if (!post.pillar || post.draft) continue;
    const other = seenPillar.get(post.category);
    if (other)
      throw new Error(
        `Two pillar articles in "${post.category}": ${other} and ${post.slug}`,
      );
    seenPillar.set(post.category, post.slug);
  }

  return posts
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

const loadPosts = () => loadPostsVersion(contentVersion());

export const listPosts = () => loadPosts();

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await loadPosts()).find((p) => p.slug === slug);
}

export async function listPostsByCategory(category: string): Promise<Post[]> {
  return (await loadPosts()).filter((p) => p.category === category);
}

export async function listPostsByAuthor(author: string): Promise<Post[]> {
  return (await loadPosts()).filter((p) => p.author === author);
}

/** Same topic first, then the newest elsewhere, so there are `limit` suggestions. */
export async function getRelatedPosts(
  post: Pick<Post, "slug" | "category">,
  limit = 3,
): Promise<Post[]> {
  const others = (await loadPosts()).filter((p) => p.slug !== post.slug);
  return [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, limit);
}

/** Public path. A topic's pillar article lives at the topic URL. */
export const postPath = (post: Pick<Post, "category" | "slug" | "pillar">) =>
  post.pillar ? `/${post.category}` : `/${post.category}/${post.slug}`;

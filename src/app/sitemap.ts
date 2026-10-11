import type { MetadataRoute } from "next";
import { AUTHORS } from "@/content/authors";
import { CATEGORIES } from "@/content/categories";
import {
  MIN_INDEXABLE_POSTS,
  isCategoryIndexable,
} from "@/content/indexability";
import { listPosts, postPath, type Post } from "@/content/posts";
import { absoluteUrl } from "@/lib/seo/site";

const newest = (posts: Post[]) =>
  posts.reduce<Date | undefined>(
    (max, p) => (!max || p.updatedAt > max ? p.updatedAt : max),
    undefined,
  );

// Site pages linked from the header and footer. External links (legal resources,
// helplines), mailto: links and the RSS feed are not pages, so they never belong here.
const STATIC_PAGES = [
  "/about",
  "/editorial-policy",
  "/disclosure",
  "/privacy",
  "/terms",
];

// Only published, indexable URLs. lastModified comes from frontmatter updatedAt.
// No priority/changefreq: Google ignores them.
// ponytail: single file; split with generateSitemaps past 5,000 URLs.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPosts();
  const indexable = posts.filter((p) => !p.noindex);

  const topics = CATEGORIES.map((c) => ({
    c,
    topicPosts: posts.filter((p) => p.category === c.slug),
  }))
    .filter(({ topicPosts }) => isCategoryIndexable(topicPosts))
    .map(({ c, topicPosts }) => ({
      url: absoluteUrl(`/${c.slug}`),
      lastModified: newest(topicPosts.filter((p) => !p.noindex)),
    }));

  const articles = indexable
    .filter((p) => !p.pillar)
    .map((p) => ({
      url: absoluteUrl(postPath(p)),
      lastModified: p.updatedAt,
      images: p.heroImage ? [absoluteUrl(p.heroImage.src)] : undefined,
    }));

  const authors = AUTHORS.filter(
    (a) =>
      indexable.filter((p) => p.author === a.slug).length >=
      MIN_INDEXABLE_POSTS,
  ).map((a) => ({ url: absoluteUrl(`/authors/${a.slug}`) }));

  return [
    { url: absoluteUrl("/"), lastModified: newest(indexable) },
    { url: absoluteUrl("/blog"), lastModified: newest(indexable) },
    ...topics,
    ...articles,
    ...authors,
    ...STATIC_PAGES.map((path) => ({ url: absoluteUrl(path) })),
  ];
}

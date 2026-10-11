import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleBody } from "@/components/article/ArticleBody";
import { RelatedPosts } from "@/components/article/RelatedPosts";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAuthor } from "@/content/authors";
import { CATEGORIES, getCategory } from "@/content/categories";
import { getPost, getRelatedPosts, listPosts, postPath } from "@/content/posts";
import {
  authorNode,
  blogPostingNode,
  breadcrumbNode,
  faqNode,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";

// Blocking on params is deliberate: full HTML on the first request (CLAUDE.md
// rule 1), never a Suspense fallback. This only turns off the dev-time instant
// navigation check; ensureStatic="navigation" still enforces static output.
export const instant = false;

export async function generateStaticParams() {
  const params = (await listPosts())
    .filter((p) => !p.pillar)
    .map((p) => ({ cluster: p.category, slug: p.slug }));
  // ensureStatic needs at least one complete param set; the placeholder renders a 404.
  return params.length > 0
    ? params
    : [{ cluster: CATEGORIES[0].slug, slug: "placeholder" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/[cluster]/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle,
    description: post.description,
    path: postPath(post),
    type: "article",
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: getAuthor(post.author)?.name,
    image: post.heroImage,
    hasOgImageFile: true,
    noindex: post.noindex,
  });
}

export default async function ArticlePage({
  params,
}: PageProps<"/[cluster]/[slug]">) {
  const { cluster, slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  // Pillars live at the topic URL; a wrong topic in the URL goes to the right one.
  if (post.pillar || post.category !== cluster)
    permanentRedirect(postPath(post));

  const path = postPath(post);
  const category = getCategory(post.category);
  const author = getAuthor(post.author);
  if (!author) throw new Error(`Unknown author ${post.author}`);
  const reviewer = post.reviewer ? getAuthor(post.reviewer) : undefined;
  const related = await getRelatedPosts(post);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: category?.name ?? post.category, path: `/${post.category}` },
    { name: post.title, path },
  ];
  const imageUrl = absoluteUrl(
    post.heroImage?.src ?? `${path}/opengraph-image`,
  );

  return (
    <>
      <JsonLd
        nodes={[
          blogPostingNode(post, path, imageUrl),
          authorNode(author),
          breadcrumbNode(crumbs),
          ...(post.faqs.length > 0 ? [faqNode(post.faqs)] : []),
        ]}
      />
      <ArticleBody
        post={post}
        author={author}
        reviewer={reviewer}
        crumbs={crumbs}
        eyebrow={category?.name ?? post.category}
        after={<RelatedPosts posts={related} />}
      />
    </>
  );
}

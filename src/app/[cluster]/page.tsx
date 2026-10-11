import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article/ArticleBody";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { PostList } from "@/components/ui/PostCard";
import { getAuthor } from "@/content/authors";
import { CATEGORIES, getCategory, type Category } from "@/content/categories";
import { isCategoryIndexable } from "@/content/indexability";
import { listPostsByCategory } from "@/content/posts";
import {
  authorNode,
  blogPostingNode,
  breadcrumbNode,
  faqNode,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site";

// Blocking on params is deliberate: full HTML on the first request (CLAUDE.md
// rule 1), never a Suspense fallback. This only turns off the dev-time instant
// navigation check; ensureStatic="navigation" still enforces static output.
export const instant = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ cluster: c.slug }));
}

/** The topic page is the pillar page: the pillar article when there is one, else a hub listing. */
async function loadTopic(slug: string) {
  const category = getCategory(slug);
  if (!category) return undefined;
  const posts = await listPostsByCategory(slug);
  return {
    category,
    pillar: posts.find((p) => p.pillar),
    others: posts.filter((p) => !p.pillar),
    noindex: !isCategoryIndexable(posts),
  };
}

const hubTitle = (category: Category) => {
  const full = `${category.name}: guides for families | ${SITE_NAME}`;
  return full.length <= 60 ? full : `${category.name}: guides for families`;
};

export async function generateMetadata({
  params,
}: PageProps<"/[cluster]">): Promise<Metadata> {
  const topic = await loadTopic((await params).cluster);
  if (!topic) return {};
  const { category, pillar, noindex } = topic;
  return buildMetadata({
    title: pillar?.seoTitle ?? hubTitle(category),
    description: pillar?.description ?? category.description,
    path: `/${category.slug}`,
    type: pillar ? "article" : "website",
    publishedAt: pillar?.publishedAt,
    updatedAt: pillar?.updatedAt,
    image: pillar?.heroImage,
    noindex,
  });
}

export default async function TopicPage({ params }: PageProps<"/[cluster]">) {
  const topic = await loadTopic((await params).cluster);
  if (!topic) notFound();
  const { category, pillar, others } = topic;

  const path = `/${category.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: category.name, path },
  ];
  const list =
    others.length > 0 ? (
      <PostList posts={others} />
    ) : (
      <p className="rounded-lg border border-dashed border-border p-6 text-muted">
        Guides on this topic are being written and reviewed. Check back soon.
      </p>
    );

  if (pillar) {
    const author = getAuthor(pillar.author);
    if (!author) throw new Error(`Unknown author ${pillar.author}`);
    const reviewer = pillar.reviewer ? getAuthor(pillar.reviewer) : undefined;
    const imageUrl = absoluteUrl(pillar.heroImage?.src ?? "/opengraph-image");
    return (
      <>
        <JsonLd
          nodes={[
            blogPostingNode(pillar, path, imageUrl),
            authorNode(author),
            breadcrumbNode(crumbs),
            ...(pillar.faqs.length > 0 ? [faqNode(pillar.faqs)] : []),
          ]}
        />
        <ArticleBody
          post={pillar}
          author={author}
          reviewer={reviewer}
          crumbs={crumbs}
          eyebrow={`Complete guide: ${category.name}`}
          after={
            <section
              aria-labelledby="more"
              className="mt-16 border-t border-border pt-10"
            >
              <h2
                id="more"
                className="mb-6 text-2xl leading-snug sm:text-[1.75rem]"
              >
                More on {category.name.toLowerCase()}
              </h2>
              {list}
            </section>
          }
        />
      </>
    );
  }

  return (
    <Container>
      <JsonLd nodes={[breadcrumbNode(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 max-w-measure">
        <p className="text-sm font-semibold tracking-wide text-trust uppercase">
          Topic
        </p>
        <h1 className="mt-2 text-[2rem] leading-tight sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-4 text-muted">{category.description}</p>
      </header>
      <section aria-labelledby="articles" className="mt-10">
        <h2 id="articles" className="mb-6 text-2xl leading-snug">
          Guides
        </h2>
        {list}
      </section>
    </Container>
  );
}

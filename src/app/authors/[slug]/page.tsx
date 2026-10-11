import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar, BioParagraphs } from "@/components/article/AuthorBox";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { PostList } from "@/components/ui/PostCard";
import { AUTHORS, getAuthor } from "@/content/authors";
import { MIN_INDEXABLE_POSTS } from "@/content/indexability";
import { listPostsByAuthor } from "@/content/posts";
import { authorNode, breadcrumbNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

// Blocking on params is deliberate (see the article page).
export const instant = false;

export function generateStaticParams() {
  return AUTHORS.map((a) => ({ slug: a.slug }));
}

async function load(slug: string) {
  const author = getAuthor(slug);
  return author ? { author, posts: await listPostsByAuthor(slug) } : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/authors/[slug]">): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return {};
  const { author, posts } = data;
  return buildMetadata({
    title: `${author.name}, author at ${SITE_NAME}`,
    description: `${author.name} writes for ${SITE_NAME}, an independent guide for Indian families on marriage background verification and matrimonial fraud.`,
    path: `/authors/${author.slug}`,
    noindex: posts.filter((p) => !p.noindex).length < MIN_INDEXABLE_POSTS,
  });
}

export default async function AuthorPage({
  params,
}: PageProps<"/authors/[slug]">) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { author, posts } = data;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: author.name, path: `/authors/${author.slug}` },
  ];

  return (
    <Container>
      <JsonLd nodes={[authorNode(author), breadcrumbNode(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 flex max-w-measure flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar author={author} size={96} />
        <div>
          <h1 className="text-[2rem] leading-tight sm:text-4xl">
            {author.name}
          </h1>
          <p className="mt-1 text-muted">{author.role}</p>
        </div>
      </header>
      <div className="mt-6 max-w-measure space-y-4">
        <BioParagraphs bio={author.bio} />
      </div>
      {author.expertise.length > 0 && (
        <ul
          className="mt-5 flex flex-wrap gap-2"
          aria-label="Areas of expertise"
        >
          {author.expertise.map((topic) => (
            <li
              key={topic}
              className="rounded-full bg-trust-soft px-3 py-1 text-sm font-semibold text-trust"
            >
              {topic}
            </li>
          ))}
        </ul>
      )}
      {author.sameAs.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-5">
          {author.sameAs.map((url) => (
            <li key={url}>
              <a
                href={url}
                rel="me noopener"
                className="tap text-trust underline underline-offset-2"
              >
                {new URL(url).hostname.replace(/^www\./, "")}
              </a>
            </li>
          ))}
        </ul>
      )}
      <section aria-labelledby="by-author" className="mt-12">
        <h2 id="by-author" className="mb-6 text-2xl leading-snug">
          Articles by {author.name}
        </h2>
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <p className="text-muted">Articles coming soon.</p>
        )}
      </section>
    </Container>
  );
}

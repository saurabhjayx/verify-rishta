import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { InfiniteList } from "@/components/ui/InfiniteList";
import { PostCard } from "@/components/ui/PostCard";
import { listPosts } from "@/content/posts";
import { breadcrumbNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Blog: Marriage Verification Guides and Articles",
  description:
    "Every VerifyRishta guide in one place: marriage background verification, matrimonial fraud, documents, NRI marriages and advice for parents.",
  path: "/blog",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
];

// ponytail: every card ships in the RSC payload and only the first 12 render
// without JS; move to fetched /blog/page/[n] chunks past a few hundred posts.
export default async function BlogPage() {
  const posts = await listPosts();
  return (
    <Container>
      <JsonLd nodes={[breadcrumbNode(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 max-w-measure">
        <h1 className="text-[2rem] leading-tight sm:text-4xl">All articles</h1>
        <p className="mt-4 text-muted">
          Every guide on VerifyRishta, newest first.
        </p>
      </header>
      <section aria-label="Articles" className="mt-10">
        {posts.length > 0 ? (
          <InfiniteList
            items={posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          />
        ) : (
          <p className="rounded-lg border border-dashed border-border p-6 text-muted">
            Guides are being written and reviewed. Check back soon.
          </p>
        )}
      </section>
    </Container>
  );
}

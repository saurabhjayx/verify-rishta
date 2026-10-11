import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { PostList } from "@/components/ui/PostCard";
import { ArrowRight, BookOpen, Scale } from "@/components/ui/icons";
import { CATEGORIES } from "@/content/categories";
import { listPosts } from "@/content/posts";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "VerifyRishta: Marriage Background Verification Guides",
  description: SITE_DESCRIPTION,
  path: "/",
});

const TRUST_POINTS = [
  { icon: BookOpen, text: "Laws and statistics linked to official sources" },
  { icon: Scale, text: "Free to read, no sign-up, never legal advice" },
];

export default async function HomePage() {
  const posts = await listPosts();
  // The Milne Se Pehle topic is reachable but not promoted here.
  const topics = CATEGORIES.filter((c) => c.slug !== "milne-se-pehle");

  return (
    <Container>
      <JsonLd />
      <section className="max-w-measure py-4 sm:py-10">
        <p className="text-sm font-semibold tracking-wide text-trust uppercase">
          Marriage background verification
        </p>
        <h1 className="mt-3 text-[2.125rem] leading-tight sm:text-5xl">
          Check a rishta with confidence, not suspicion
        </h1>
        <p className="mt-5">
          Marriage background verification means checking that the key facts in
          a biodata are true: identity, education, work, marital status and
          family. Done openly, with consent from both families, it protects
          everyone. These guides explain how, in plain language.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/marriage-verification-basics" className="btn-primary">
            Start with the basics
            <ArrowRight />
          </Link>
          <Link href="/matrimonial-fraud" className="btn-secondary">
            Spot matrimonial fraud
          </Link>
        </div>
        <ul className="mt-8 space-y-3 text-base text-muted">
          {TRUST_POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon className="mt-0.5 shrink-0 text-trust" />
              {text}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="topics" className="mt-10 sm:mt-14">
        <h2 id="topics" className="text-2xl leading-snug sm:text-[1.75rem]">
          Start here
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((category) => {
            const count = posts.filter(
              (p) => p.category === category.slug,
            ).length;
            return (
              <li key={category.slug}>
                <article className="relative flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-trust">
                  <h3 className="text-xl leading-snug">
                    <Link
                      href={`/${category.slug}`}
                      className="after:absolute after:inset-0 after:rounded-lg"
                    >
                      {category.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-base text-muted">
                    {category.description}
                  </p>
                  <p className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-trust">
                    {count > 0
                      ? `${count} ${count === 1 ? "guide" : "guides"}`
                      : "Guides coming soon"}
                    <ArrowRight width={16} height={16} />
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      {posts.length > 0 && (
        <section aria-labelledby="latest" className="mt-14">
          <h2
            id="latest"
            className="mb-6 text-2xl leading-snug sm:text-[1.75rem]"
          >
            Latest articles
          </h2>
          <PostList posts={posts.slice(0, 6)} />
        </section>
      )}
    </Container>
  );
}

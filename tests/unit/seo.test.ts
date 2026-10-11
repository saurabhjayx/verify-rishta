import { describe, expect, it } from "vitest";
import {
  blogPostingNode,
  breadcrumbNode,
  buildGraph,
  faqNode,
  authorNode,
  serializeJsonLd,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Post } from "@/content/posts";

const post: Post = {
  slug: "sample",
  category: "matrimonial-fraud",
  title: "Sample title",
  seoTitle: "Sample SEO title that is long enough",
  description: "x".repeat(130),
  excerpt: "Excerpt.",
  author: "saurabh",
  publishedAt: new Date("2026-10-01T00:00:00Z"),
  updatedAt: new Date("2026-10-05T00:00:00Z"),
  lastReviewedAt: new Date("2026-10-05T00:00:00Z"),
  tags: [],
  sources: [],
  faqs: [{ q: "Q?", a: "A." }],
  pillar: false,
  noindex: false,
  draft: false,
  lang: "en-IN",
  body: "Body",
  code: "",
  toc: [],
  wordCount: 1,
  readingMinutes: 1,
};

describe("buildMetadata", () => {
  it("sets absolute canonical, en_IN locale and article dates", () => {
    const meta = buildMetadata({
      title: "T",
      description: "D",
      path: "/matrimonial-fraud/sample",
      type: "article",
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    });
    expect(meta.alternates?.canonical).toBe(
      "https://verifyrishta.com/matrimonial-fraud/sample",
    );
    expect(meta.title).toEqual({ absolute: "T" });
    expect(meta.openGraph).toMatchObject({
      type: "article",
      locale: "en_IN",
      modifiedTime: "2026-10-05T00:00:00.000Z",
    });
    expect(meta.robots).toBeUndefined();
  });

  it("emits noindex,follow when asked", () => {
    expect(
      buildMetadata({ title: "T", description: "D", path: "/x", noindex: true })
        .robots,
    ).toEqual({
      index: false,
      follow: true,
    });
  });
});

describe("JSON-LD", () => {
  it("builds an article graph", () => {
    const graph = buildGraph(
      blogPostingNode(
        post,
        "/matrimonial-fraud/sample",
        "https://verifyrishta.com/og.png",
      ),
      authorNode({
        slug: "saurabh",
        name: "Saurabh",
        kind: "Person",
        role: "Author",
        bio: "Bio",
        sameAs: [],
        expertise: [],
      }),
      breadcrumbNode([
        { name: "Home", path: "/" },
        { name: "Matrimonial fraud", path: "/matrimonial-fraud" },
      ]),
      faqNode(post.faqs),
    );
    expect(graph).toMatchSnapshot();
  });

  it("describes team bylines as an Organization", () => {
    const node = authorNode({
      slug: "verify-rishta-editorial-team",
      name: "Verify Rishta Editorial Team",
      kind: "Organization",
      role: "Editorial team",
      bio: "Bio",
      sameAs: [],
      expertise: [],
    });
    expect(node).toMatchObject({
      "@type": "Organization",
      name: "Verify Rishta Editorial Team",
    });
  });

  it("escapes < so content cannot close the script tag", () => {
    const json = serializeJsonLd(
      buildGraph(faqNode([{ q: "</script><script>alert(1)", a: "a" }])),
    );
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)["@graph"][2].mainEntity[0].name).toBe(
      "</script><script>alert(1)",
    );
  });
});

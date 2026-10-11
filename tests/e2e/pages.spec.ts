import { expect, test } from "@playwright/test";
import {
  auditHtml,
  jsonLdBlocks,
  type JsonLdGraph,
} from "../../src/lib/seo/audit";

// Every route: 200, SEO audit clean, and main content present in raw HTML (no JS).
const PAGES = [
  { path: "/", text: "Check a rishta with confidence, not suspicion" },
  {
    // Pillar page: the cluster URL serves the pillar post.
    path: "/marriage-verification-basics",
    text: "Marriage background verification means checking that the main facts in a biodata are true",
  },
  {
    // Hub page: a cluster without a pillar lists its guides.
    path: "/matrimonial-fraud",
    text: "Common types of matrimonial fraud in India",
  },
  {
    path: "/matrimonial-fraud/draft-red-flags-in-a-biodata",
    text: "Most matrimonial profiles are honest.",
  },
  {
    path: "/marriage-verification-basics/draft-what-verification-checks",
    text: "Pre-matrimonial verification checks whether the main facts in a biodata are true.",
  },
  {
    path: "/authors/verify-rishta-editorial-team",
    text: "The VerifyRishta editorial team writes and reviews guides",
  },
  {
    // First batch of cards is server-rendered, so titles are in raw HTML.
    path: "/blog",
    text: "DRAFT: What to Verify Before Marrying an NRI",
  },
  {
    path: "/about",
    text: "VerifyRishta helps Indian families check that a rishta is what it claims to be",
  },
  {
    path: "/disclosure",
    text: "We want you to know this before you read any recommendation",
  },
  {
    path: "/editorial-policy",
    text: "These are the rules every article on VerifyRishta follows.",
  },
  {
    path: "/privacy",
    text: "You can read every page without creating an account",
  },
  {
    path: "/terms",
    text: "Everything on VerifyRishta is general information about marriage background verification in India.",
  },
];

for (const { path, text } of PAGES) {
  test(`${path} is complete, crawlable HTML`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(auditHtml(html, path)).toEqual([]);
    expect(html).toContain(text);
  });
}

test("article JSON-LD has BlogPosting, BreadcrumbList, author and FAQPage", async ({
  request,
}) => {
  const html = await (
    await request.get("/matrimonial-fraud/draft-red-flags-in-a-biodata")
  ).text();
  const nodes = (jsonLdBlocks(html)[0] as JsonLdGraph)["@graph"] as {
    "@type": string;
    "@id"?: string;
  }[];
  expect(nodes.map((n) => n["@type"])).toEqual(
    expect.arrayContaining(["BlogPosting", "BreadcrumbList", "FAQPage"]),
  );
  // Team byline: the author node is an Organization with its own author page.
  const author = nodes.find((n) => n["@id"]?.endsWith("#author"));
  expect(author?.["@type"]).toBe("Organization");
  expect(author?.["@id"]).toContain("/authors/verify-rishta-editorial-team");
});

test("article body is server-rendered with directives, UTMs and the disclaimer", async ({
  request,
}) => {
  const html = await (
    await request.get("/matrimonial-fraud/draft-red-flags-in-a-biodata")
  ).text();
  expect(html).toContain('<aside class="callout callout-warning">');
  expect(html).toContain("utm_source=verifyrishta");
  expect(html).toContain("This is general information, not legal advice.");
  expect(html).toContain('content="noindex, follow"'); // fixtures are drafts
});

test("unknown pages return 404", async ({ request }) => {
  for (const path of [
    "/no-such-cluster",
    "/matrimonial-fraud/no-such-post",
    "/authors/nobody",
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("footer has logo, legal resources and official help on every page", async ({
  request,
}) => {
  for (const path of [
    "/",
    "/matrimonial-fraud/draft-red-flags-in-a-biodata",
    "/privacy",
  ]) {
    const html = await (await request.get(path)).text();
    expect(html, path).toContain(
      "is an independent guide to marriage background verification",
    );
    expect(html, path).toContain(
      'alt="VerifyRishta: trust builds stronger rishtas"',
    );
    expect(html, path).not.toContain("BINA AI");
    expect(html, path).toContain("indiacode.gov.in/act/");
    expect(html, path).toContain('href="tel:1930"');
    expect(html, path).toContain("https://cybercrime.gov.in/");
  }
});

test("Milne Se Pehle is not promoted on the home page cluster list", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toContain('href="/milne-se-pehle"');
});

test("article page has the full layout: TOC, FAQ accordion, sources, author box, 3 related posts", async ({
  request,
}) => {
  const html = await (
    await request.get(
      "/marriage-verification-basics/draft-what-verification-checks",
    )
  ).text();
  expect(html).toContain('aria-label="On this page"');
  expect(html).toMatch(/<details[^>]*>\s*<summary[^>]*>\s*<h3/);
  expect(html).toContain('id="sources"');
  expect(html).toContain('id="about-author"');
  const related = html.slice(html.indexOf('id="related"'));
  expect(related.match(/<article/g)?.length).toBe(3);
});

test("pillar post URL redirects to its cluster", async ({ request }) => {
  const res = await request.get(
    "/marriage-verification-basics/draft-marriage-verification-guide",
    { maxRedirects: 0 },
  );
  expect(res.status()).toBe(308);
});

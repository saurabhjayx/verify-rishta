import { listPosts, postPath } from "@/content/posts";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/seo/site";
import { escapeXml } from "@/lib/utils/xml";

const FEED_SIZE = 50;

/** RSS 2.0, last 50 indexable posts. Prerendered at build. */
export async function GET() {
  const items = (await listPosts())
    .filter((p) => !p.noindex)
    .slice(0, FEED_SIZE)
    .map((p) => {
      const url = absoluteUrl(postPath(p));
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
    </item>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-IN</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

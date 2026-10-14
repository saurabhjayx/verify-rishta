import { listPosts, postPath } from "@/content/posts";
import { SUPPORT_EMAIL } from "@/lib/legal";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  siteAbout,
} from "@/lib/seo/site";

const TOP_POSTS = 20;

/** MDX source of pillar pages plus the 20 newest indexable posts. */
export async function GET() {
  const indexable = (await listPosts()).filter((p) => !p.noindex);
  const picked = [
    ...indexable.filter((p) => p.pillar),
    ...indexable.filter((p) => !p.pillar).slice(0, TOP_POSTS),
  ];

  // Charts are MDX components; keep their title, drop the props.
  const plainBody = (body: string) =>
    body
      .replace(/<BarChart[\s\S]*?title="([^"]*)"[\s\S]*?\/>/g, "[Chart: $1]")
      .trim();
  // FAQs live in frontmatter, not the body, so append them as plain Q and A.
  const faqText = (faqs: (typeof picked)[number]["faqs"]) =>
    faqs.length === 0
      ? ""
      : `\n\n## Frequently asked questions\n\n${faqs
          .map((f) => `Q: ${f.q}\nA: ${f.a}`)
          .join("\n\n")}`;
  const bodies = picked.map(
    (p) =>
      `# ${p.title}\n\nURL: ${absoluteUrl(postPath(p))}\n\n${plainBody(p.body)}${faqText(p.faqs)}`,
  );
  const intro = [
    `# ${SITE_NAME}: full text of key pages`,
    `> ${SITE_DESCRIPTION}`,
    siteAbout(SUPPORT_EMAIL),
  ].join("\n\n");
  const text = [intro, ...bodies].join("\n\n---\n\n");
  return new Response(`${text}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

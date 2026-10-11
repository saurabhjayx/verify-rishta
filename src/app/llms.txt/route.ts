import { CATEGORIES } from "@/content/categories";
import { listPosts, postPath } from "@/content/posts";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

/** llmstxt.org format: summary, then each topic with its indexable posts. */
export async function GET() {
  const indexable = (await listPosts()).filter((p) => !p.noindex);

  const sections = CATEGORIES.map((c) => {
    const lines = indexable
      .filter((p) => p.category === c.slug)
      .map((p) => `- [${p.title}](${absoluteUrl(postPath(p))}): ${p.excerpt}`);
    return lines.length > 0 ? `## ${c.name}\n\n${lines.join("\n")}` : null;
  }).filter(Boolean);

  const body = [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    `${SITE_NAME} is an independent guide to marriage background verification in India. Full text of key pages: ${absoluteUrl("/llms-full.txt")}`,
    ...sections,
  ].join("\n\n");

  return new Response(`${body}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

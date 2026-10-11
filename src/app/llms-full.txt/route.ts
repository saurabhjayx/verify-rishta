import { listPosts, postPath } from "@/content/posts";
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site";

const TOP_POSTS = 20;

/** MDX source of pillar pages plus the 20 newest indexable posts. */
export async function GET() {
  const indexable = (await listPosts()).filter((p) => !p.noindex);
  const picked = [
    ...indexable.filter((p) => p.pillar),
    ...indexable.filter((p) => !p.pillar).slice(0, TOP_POSTS),
  ];

  const bodies = picked.map(
    (p) =>
      `# ${p.title}\n\nURL: ${absoluteUrl(postPath(p))}\n\n${p.body.trim()}`,
  );
  const text = [`# ${SITE_NAME}: full text of key pages`, ...bodies].join(
    "\n\n---\n\n",
  );
  return new Response(`${text}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

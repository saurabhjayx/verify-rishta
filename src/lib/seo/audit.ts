// SEO assertions on raw server HTML, shared by `pnpm seo:check` and Playwright e2e.
// Regex-based on purpose: it audits our own Next output, not arbitrary HTML.

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
};
const decode = (s: string) =>
  s.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (e) => ENTITIES[e] ?? e);

const meta = (html: string, attr: "name" | "property", key: string) =>
  new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`).exec(html)?.[1];

export type JsonLdGraph = { "@graph": { "@type": string }[] };

export function jsonLdBlocks(html: string): unknown[] {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => JSON.parse(m[1] ?? ""));
}

/** Returns a list of problems; empty means the page passes. `path` is the URL path that was fetched. */
export function auditHtml(html: string, path: string): string[] {
  const problems: string[] = [];
  const check = (ok: boolean, message: string) => {
    if (!ok) problems.push(message);
  };

  check(/<html[^>]* lang="en-IN"/.test(html), 'html lang must be "en-IN"');

  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  check(h1s === 1, `expected exactly one <h1>, found ${h1s}`);

  const title = decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "");
  check(
    title.length >= 30 && title.length <= 60,
    `title must be 30 to 60 chars, is ${title.length}: "${title}"`,
  );

  const description = decode(meta(html, "name", "description") ?? "");
  check(
    description.length >= 120 && description.length <= 160,
    `meta description must be 120 to 160 chars, is ${description.length}`,
  );

  const canonicals = [
    ...html.matchAll(/<link rel="canonical" href="([^"]*)"/g),
  ].map((m) => m[1] ?? "");
  check(
    canonicals.length === 1,
    `expected one canonical, found ${canonicals.length}`,
  );
  const canonical = canonicals[0];
  if (canonical) {
    check(
      /^https?:\/\//.test(canonical),
      `canonical must be absolute: ${canonical}`,
    );
    const url = new URL(canonical, "http://x");
    const expected = path
      .split("?")[0]
      ?.toLowerCase()
      .replace(/(.)\/+$/, "$1");
    check(
      url.pathname === expected,
      `canonical path ${url.pathname} != ${expected}`,
    );
    check(
      url.search === "",
      `canonical must not have a query string: ${canonical}`,
    );
  }

  for (const key of ["og:title", "og:description", "og:url", "og:image"]) {
    check(!!meta(html, "property", key), `missing ${key}`);
  }
  check(
    meta(html, "property", "og:locale") === "en_IN",
    "og:locale must be en_IN",
  );
  check(!!meta(html, "name", "twitter:card"), "missing twitter:card");
  const robots = meta(html, "name", "robots") ?? "";
  check(
    /(^|, )follow($|,)/.test(robots),
    `robots meta must say follow, is "${robots}"`,
  );

  let blocks: unknown[] = [];
  try {
    blocks = jsonLdBlocks(html);
  } catch (error) {
    problems.push(`JSON-LD does not parse: ${(error as Error).message}`);
  }
  check(
    blocks.length === 1,
    `expected one JSON-LD block, found ${blocks.length}`,
  );
  const types = ((blocks[0] as JsonLdGraph | undefined)?.["@graph"] ?? []).map(
    (n) => n["@type"],
  );
  check(
    types.includes("Organization") && types.includes("WebSite"),
    `JSON-LD @graph needs Organization and WebSite, has ${types.join(", ")}`,
  );

  return problems;
}

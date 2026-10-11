import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { AUTHORS } from "@/content/authors";
import { CATEGORIES } from "@/content/categories";
import { env } from "@/env";

/**
 * Where to redirect a request, or null if it is already canonical.
 * (1) www.<site> -> SITE_URL origin (DNS/CDN should do this first; this is the fallback),
 * (2) uppercase path -> lowercase. Trailing slashes are handled natively by
 * Next (trailingSlash: false). Slug redirects live in content/redirects.json.
 * Only the exact www host is matched, so a spoofed Host header is never echoed.
 */
export function canonicalRedirect(
  host: string,
  path: string,
  search: string,
  siteUrl = env.SITE_URL,
): string | null {
  const lower = path.toLowerCase();
  if (host === `www.${new URL(siteUrl).host}`)
    return `${siteUrl}${lower}${search}`;
  return lower === path ? null : `${lower}${search}`;
}

/** Top-level routes that are not topics. A unit test keeps this in sync with src/app. */
export const STATIC_SEGMENTS = new Set([
  "about",
  "authors",
  "blog",
  "disclosure",
  "editorial-policy",
  "opengraph-image",
  "privacy",
  "terms",
]);
const TOPICS = new Set<string>(CATEGORIES.map((c) => c.slug));
const AUTHOR_SLUGS = new Set(AUTHORS.map((a) => a.slug));

/**
 * True when a lowercase path can only end in a 404. Those are answered with the
 * static not-found page: a request-time notFound() under Cache Components sends
 * an empty body that only JavaScript fills in. Articles in the wrong topic still
 * pass, so the page can redirect them to their real URL.
 */
export function isKnownMiss(
  pathname: string,
  articles: ReadonlySet<string>,
): boolean {
  const [first, second, ...rest] = pathname.split("/").filter(Boolean);
  if (!first || rest.length > 0) return false;
  if (second === undefined)
    return !TOPICS.has(first) && !STATIC_SEGMENTS.has(first);
  if (first === "authors") return !AUTHOR_SLUGS.has(second);
  return !articles.has(second);
}

const isProd = process.env.NODE_ENV === "production";
let articleCache: Set<string> | undefined;

/** Article slugs = file names (enforced by content:lint). Drafts are skipped in production. */
function articleSlugs(): Set<string> | undefined {
  if (isProd && articleCache) return articleCache;
  try {
    const dir = path.resolve(env.CONTENT_DIR, "articles");
    const isDraft = (file: string) =>
      /^draft:\s*true\s*$/m.test(
        readFileSync(path.join(dir, file), "utf8").split(/^---\s*$/m)[1] ?? "",
      );
    articleCache = new Set(
      readdirSync(dir)
        .filter((f) => f.endsWith(".mdx") && !(isProd && isDraft(f)))
        .map((f) => f.slice(0, -".mdx".length)),
    );
    return articleCache;
  } catch {
    return undefined; // content not readable here: let the page decide
  }
}

// Matches no route, so Next serves the prerendered not-found page with a 404.
const NOT_FOUND_PATH = "/_/not/found";

export function proxy(request: NextRequest) {
  // Compare the Host header itself: nextUrl carries the server's own host and port.
  const { pathname, search } = request.nextUrl;
  const target = canonicalRedirect(
    request.headers.get("host") ?? "",
    pathname,
    search,
  );
  if (target)
    return NextResponse.redirect(new URL(target, request.nextUrl), 301);
  const articles = articleSlugs();
  if (articles && isKnownMiss(pathname, articles))
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};

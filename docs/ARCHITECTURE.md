# Architecture - VerifyRishta

## 1. Rendering model

Articles are `.mdx` files in git, read and compiled at build time. Every page is static HTML; publishing is commit + redeploy. MongoDB is **not** used for content. It is reserved for comments and other user-generated or dynamic data, added only when that feature is built (behind Suspense or a client island, so article pages stay static).

Next 16 with Cache Components and Partial Prefetching. `export const ensureStatic = "navigation"` on the root layout makes the build fail on any uncached data or request-time API, so every route ships complete HTML (CLAUDE.md rule 1). The content loader (`src/content/posts.ts`) reads all articles once per build inside `"use cache"`. Dynamic routes set `export const instant = false`: they await params outside Suspense on purpose (full HTML, never a fallback); this only silences the dev-time instant-navigation check.

| Route | Rendering |
|---|---|
| `/` | Static |
| `/[cluster]` (topic page: pillar article if one exists, else hub listing) | Static, one per topic in `src/content/categories.ts` |
| `/[cluster]/[slug]` (articles) | Static, one per non-draft article |
| `/authors/[slug]` | Static, one per author in `src/content/authors.ts` |
| `/tags/[slug]` | Deferred to wave 2 |
| `/about`, `/disclosure`, `/privacy`, `/terms`, `/editorial-policy` | Static |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt`, `/llms-full.txt`, `/manifest.webmanifest`, OG images | Static (metadata routes / route handlers) |

`generateStaticParams` must return at least one param under Cache Components; with no articles the article route returns a placeholder that 404s.

**URL shape:** `/<category-slug>/<post-slug>`. A post with `pillar: true` is served at `/<category-slug>` and its own URL redirects there. A post in the wrong category URL 308s to the right one.

## 2. Folder structure

```
.
├── CLAUDE.md
├── docs/
├── assets/brand/              # original logo/icon files (not served)
├── content/
│   ├── articles/<slug>.mdx    # one file per article: frontmatter + MDX body
│   └── redirects.json         # [{ "from": "/old", "to": "/new" }], applied by next.config
├── public/
│   ├── icons/                 # PWA manifest icons (PNG by spec)
│   └── images/                # WebP only (owner's rule)
├── scripts/
│   ├── content-lint.ts
│   ├── seo-check.ts
│   └── indexnow.ts
├── src/
│   ├── app/                   # routes (see section 1), manifest.ts, sitemap.ts, robots.ts, icons
│   ├── assets/                # brand mark (WebP) + base64 copies for OG images
│   ├── components/            # article/, layout/, seo/, ui/, analytics/
│   ├── content/
│   │   ├── categories.ts      # topics: slug, name, description
│   │   ├── authors.ts         # authors/reviewers: Person or Organization
│   │   ├── schema.ts          # Zod frontmatter schema = single source of truth
│   │   ├── article.ts         # checkArticle(): parse + validate one file (shared by build and lint)
│   │   ├── posts.ts           # server-only loader: read, validate, compile, cache
│   │   ├── redirects.ts       # redirects.json schema
│   │   └── indexability.ts    # noindex thresholds
│   ├── lib/
│   │   ├── markdown/          # MDX compile, directives, TOC, links/UTM, images
│   │   ├── content-lint/      # style linter
│   │   └── seo/               # metadata, JSON-LD, UTM, audit, IndexNow
│   ├── env.ts
│   └── proxy.ts               # www->apex, lowercase
└── tests/
    ├── unit/
    ├── e2e/
    └── fixtures/content/      # sample articles + redirects used by e2e and Lighthouse
```

## 3. Content model (frontmatter)

`src/content/schema.ts` is the single source of truth (Zod, `.strict()`, so typos fail).

```yaml
---
title: "Hidden Red Flags Before Marriage"      # H1; also <title> if 30 to 60 chars
slug: "hidden-red-flags-before-marriage"       # must equal the file name
description: "..."                             # 120 to 160 chars: meta description, card, RSS
publishedAt: "2026-10-11"
updatedAt: "2026-10-11"                        # optional; bump only on meaningful change
author: "Verify Rishta Editorial Team"         # slug or name from src/content/authors.ts
category: "Matrimonial fraud"                  # slug or name from src/content/categories.ts
draft: false                                   # true: hidden in production, visible in `pnpm dev`

# Optional
seoTitle: "..."            # required if title is not 30 to 60 chars
excerpt: "..."             # defaults to description
lastReviewedAt: "..."      # defaults to updatedAt; shown as "Last reviewed"
reviewer: "..."            # author slug or name
tags: [parents]
sources: [{ title, url, publisher, accessed: "YYYY-MM-DD" }]
faqs: [{ q, a }]           # rendered as an accordion + FAQPage JSON-LD
pillar: false              # true: this is the topic's main guide, served at /<category>
noindex: false
heroImage: { src: "/images/posts/x.webp", alt, width, height }
audience / primaryQuery / secondaryQueries   # editorial only, never rendered
---
```

The body may start with `# <title>`; it is removed at render (the H1 comes from `title`). Validation runs in both `content:lint` and the build: unknown author or category, slug/file mismatch, duplicate pillar per topic, or invalid MDX fails the build.

### Redirects
`content/redirects.json`, loaded by `next.config` `redirects()` at the routing layer (308 by default). Add an entry whenever a published URL changes.

### Authors and topics
Plain TypeScript in `src/content/`. Authors have `kind: "Person" | "Organization"` (team bylines are Organizations in JSON-LD).

### User-generated data (later)
MongoDB Atlas (Mumbai) for comments, newsletter subscribers (DPDP: consent timestamp, purpose, deletion) and similar. Not wired yet.

## 4. MDX pipeline (`src/lib/markdown/compile.ts`)

`@mdx-js/mdx` compile with remark `remark-gfm` -> `remark-directive` -> our directive plugin -> strip leading H1; rehype `rehype-slug` -> TOC collector -> links (`rel="noopener"`, UTMs on milnesepehle.in) -> images (lazy). Output is a function body, cached with the post and rendered on the server by `ArticleContent` (`run()` + `react/jsx-runtime`). Zero client JS.

No sanitizer: MDX is code (JSX and expressions are allowed), so articles are trusted input, reviewed in git like any other source file. Invalid MDX (for example a bare `<` or `{`) fails `content:lint` with a line number.

Custom directives:
- `:::msp-cta{placement="mid"}` renders the Milne Se Pehle CTA block.
- `:::callout{type="warning"}` (red flag) and `:::callout{type="info"}` (good to know).
- `:::experience` for "What we see at Milne Se Pehle" boxes (real data only).
- `:::composite` wraps a labelled composite example story.

## 5. SEO {#seo}

### Metadata
`src/lib/seo/metadata.ts` exports `buildMetadata({ title, description, path, image, type, publishedAt, updatedAt, noindex, alternates })`. Every page calls it. `metadataBase` set in root layout.

### JSON-LD
`src/lib/seo/jsonld.ts` builders return typed objects (use `schema-dts` types). Rendered in a single `<script type="application/ld+json">` per page using a `@graph`.

- Site-wide: `Organization` (VerifyRishta, `parentOrganization` -> Milne Se Pehle / BINA AI Private Limited, `sameAs`), `WebSite`.
- Article: `BlogPosting` (`headline`, `datePublished`, `dateModified`, `author` Person with `url` to author page and `sameAs`, `publisher`, `image`, `mainEntityOfPage`, `inLanguage`), `BreadcrumbList`.
- Optional `FAQPage` when the post has `faqs`.

Unit tests validate builders against `schema-dts` types and snapshot output.

### robots.ts
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

# Do NOT disallow query strings. Inbound links often carry UTM params;
# Google must be able to crawl them to see the canonical and consolidate signals.

# AI crawlers explicitly allowed (we want to be cited)
User-agent: GPTBot / OAI-SearchBot / ChatGPT-User
User-agent: ClaudeBot / Claude-SearchBot / Claude-User
User-agent: PerplexityBot / Perplexity-User
User-agent: Google-Extended
User-agent: Applebot / Applebot-Extended
User-agent: Bingbot
User-agent: CCBot
Allow: /
Disallow: /api/

Sitemap: https://verifyrishta.com/sitemap.xml
```
Implement as separate `rules` entries in `app/robots.ts` (one per user agent). Re-check the crawler list each quarter: names change.

Decision: allow training crawlers (GPTBot, Google-Extended, CCBot). For a brand that wants to be the default answer in AI assistants, being in training data helps more than it costs. Revisit if content scraping becomes a problem.

### sitemap
- `app/sitemap.ts` returns home, cluster pages, indexable posts, author pages with 5+ posts (same threshold as the noindex rule; sitemap lists only indexable URLs).
- `lastModified` = `updatedAt` (only bump on meaningful content change, not on rebuild).
- Images included via the `images` field.
- Hindi posts include `alternates.languages` for hreflang.

### hreflang (phase 3)
Hindi lives at `/hi/<cluster>/<slug>`. Only human-reviewed translations get hreflang pairs (`en-IN`, `hi-IN`, `x-default` -> English). Machine-only translations are not published.

### llms.txt
`/llms.txt`: site summary, then each cluster with links and one-line excerpts. `/llms-full.txt`: plain-text bodies of pillar pages and top 20 posts. Generated from DB, cached with tag `sitemap`.

### IndexNow
`scripts/indexnow.ts` posts URLs to `https://api.indexnow.org/indexnow` with the key file committed at `public/<key>.txt` (a route would collide with `[cluster]`). Run it after a deploy that publishes or changes articles: `pnpm indexnow <url ...>`.

## 6. Proxy (`src/proxy.ts`)
Order: (1) host `www.verifyrishta.com` -> 301 apex (fallback; primary is DNS/CDN), (2) uppercase path -> 301 lowercase. Trailing slash is handled natively (`trailingSlash: false`, 308). Slug redirects are not here (see `redirects` above). Matcher excludes `_next`, static files and `api`.

## 7. Performance
- Fonts: `next/font` self-hosted. Latin: one variable font (Inter, `display: "optional"` with the size-adjusted fallback, so no late repaint or layout shift). Devanagari (phase 3): Noto Sans Devanagari or Mukta, subset, only loaded on `/hi/*`.
- Images: `next/image`, explicit width/height, `priority` only on the LCP hero, AVIF + WebP.
- No third-party scripts in `<head>`. GA4 via `next/script` `strategy="afterInteractive"`, loaded only after consent banner choice if we show one.
- No carousels, no animation libraries, no icon font. Inline SVG icons.
- `@next/bundle-analyzer` (webpack-only) runs as a separate `ANALYZE=true next build --webpack` in CI on PRs for the report. The hard JS budget gate is Lighthouse CI `resource-summary:script:size` on the real Turbopack build.

## 7a. Design system ("Calm clinic")
- Tokens live in `src/app/globals.css` (`:root` CSS variables, mapped to Tailwind via `@theme inline`). Dark mode swaps variable values under `prefers-color-scheme`; components never use `dark:` classes.
- Palette: trust teal `--trust`, burnt saffron `--accent` (CTAs only), warm stone greys. All text pairs pass WCAG AA in both modes (lowest 5.7:1).
- Fonts: Noto Serif 600 (headings) + Noto Sans variable (body), `display: optional`. Hindi pairs: Noto Serif Devanagari, Noto Sans (Devanagari subset).
- Reading: 18px body, line-height 1.7, `max-w-measure` = 68ch. Tap targets >= 44px (`.tap`, cards use a stretched link).
- Zero client components: mobile nav, TOC (mobile) and FAQ accordion are native `<details>`. Desktop TOC is CSS `sticky`.
- Brand assets: originals in `assets/brand/` (not served). Favicons by Next file convention: `src/app/favicon.ico`, `src/app/icon.png` (32px, transparent), `src/app/apple-icon.png` (180px, opaque). PWA: `src/app/manifest.ts` + `public/icons/` (192, 512, maskable 512 with the mark inside the 80% safe zone). Header mark: `src/assets/brand-mark.webp`. Share cards embed base64 copies from `src/assets/brand-images.ts` (next/og cannot read WebP or the filesystem at runtime).
- Images: WebP for all content and UI images (owner's rule). PNG/ICO only where a platform requires it (favicons, apple/manifest icons, next/og output).
- Markdown directive styles: `.prose-article .experience | .callout-warning | .callout-info | .composite | .msp-cta` in `globals.css`.

## 8. Analytics and attribution
- Google Search Console + Bing Webmaster Tools (verified via DNS TXT).
- GA4 with a custom event `msp_click` (placement, post slug) on CTA clicks.
- UTMs on every milnesepehle.in link so MSP's GA4/PostHog can attribute signups to articles.
- Weekly report (phase 3 script): top queries, impressions, CTR, MSP clicks per post.

## 9. CI (`.github/workflows/ci.yml`)
On PR: install (pnpm cache) -> typecheck -> lint -> `content:lint content/ tests/fixtures/content/` -> unit tests -> build (real content) -> build (fixtures, `CONTENT_DIR=tests/fixtures/content`) -> Playwright e2e on fixtures (raw HTML via the `request` fixture, no browser download) -> Lighthouse CI (mobile, budgets) -> `next analyze --output` report. No database in CI.

Lighthouse uses `throttlingMethod: "devtools"` (real slow-4G + 4x CPU throttling). The default simulated mode puts all async JS on the LCP path and reports ~2.2s LCP for pages whose observed LCP equals FCP; devtools mode measures ~1.6s.
Builds never run on the production server (lesson from the MSP EC2 OOM incidents).

## 10. Deployment options (decide later)

| Option | Pros | Cons |
|---|---|---|
| Vercel (region `bom1`) | Static output native, zero ops, preview URLs per PR, redeploy on push | Vendor coupling, cost if traffic spikes |
| AWS EC2 + Nginx + PM2 (`output: standalone`) | Same ops as MSP, cheap at low traffic | ISR cache is on local disk: fine for one instance, breaks with more than one without a shared cache handler. Builds must happen in CI. |
| Cloudflare (OpenNext) | Cheap, global edge | More moving parts with ISR |

Recommendation: Vercel for this site. It is a content site; ops time is better spent on writing. Keep MSP on EC2.

Whichever host: Cloudflare (or host CDN) in front, `www` -> apex at DNS/edge as well as proxy. MongoDB Atlas (`ap-south-1`) only once comments/UGC exist.

# CLAUDE.md - VerifyRishta

Read this file fully at the start of every session. It is the source of truth for how this project is built and written. Details live in `docs/`; read the relevant doc before touching that area.

| Doc | Read before |
|---|---|
| `docs/PLAN.md` | Planning, roadmap, topic clusters, KPIs |
| `docs/ARCHITECTURE.md` | Any code change |
| `docs/CONTENT_STYLE.md` | Writing, editing or reviewing any article |
| `docs/TASK_DESIGN.md` | When the user says "design a task" |

---

## 1. What this project is

- **Site:** https://verifyrishta.com (apex is canonical; `www` 301s to apex).
- **Purpose:** The most useful, most trusted resource on the internet about marriage background verification in India. Topics: what it is, why it is needed, matrimonial fraud, detective agencies vs consent-based self-verification, how families can ask for verification, and how Milne Se Pehle helps.
- **Ownership:** VerifyRishta is an independent venture. Legal pages name the operator and Data Fiduciary as "Verify Rishta Team" (contact verifyrishta@gmail.com). **Never write the founder's full name anywhere** (code, pages, metadata, JSON-LD, articles, docs); the only personal name allowed is "Saurabh" as an article author. Footer, About, privacy and terms do not mention Milne Se Pehle or BINA AI Private Limited.
- **Founder link is disclosed once.** The founder also founded https://milnesepehle.in, and articles may still recommend it. /disclosure states that connection in one line. Keep it while any article links to Milne Se Pehle: a hidden material connection found later destroys trust, and Google treats undisclosed self-promotion as a link scheme.

## 2. Stack (do not change without asking)

- Next.js latest stable, App Router, React Server Components, TypeScript `strict`.
- Articles are `.mdx` files in git (`content/articles/<slug>.mdx`, frontmatter + body), compiled at build. **Never store article content in MongoDB.** MongoDB Atlas (Mumbai, official `mongodb` driver, no Mongoose) is reserved for comments and other user-generated or dynamic data, added when that feature is built.
- Zod for every schema boundary.
- Tailwind CSS. No component library that ships heavy client JS.
- MDX compiled at build with `@mdx-js/mdx` (remark + rehype plugins) and rendered as server components. No client-side markdown rendering, ever.
- Package manager: `pnpm`. Node: current LTS, pinned in `.nvmrc` and `package.json#engines`.
- Hosting: undecided (Vercel or AWS). Code must work for both: no host-specific APIs in app code; `output: "standalone"` must build cleanly.

## 3. Non-negotiable engineering rules

1. **Article HTML must be complete in the server response.** Every article, pillar and listing page is statically generated at build (`generateStaticParams`, `ensureStatic = "navigation"`). Verify with `curl -s <url> | grep "<first paragraph text>"`. The empty-HTML SSR bug on milnesepehle.in must never happen here.
2. **Zero client components inside the article body.** Allowed client islands: mobile nav toggle, share button, newsletter form. Each must justify itself.
3. **Performance budget (mobile, 4G, p75):** LCP < 2.0s, CLS < 0.05, INP < 200ms, first-load JS on article pages < 90 KB gzipped. Lighthouse CI enforces this in GitHub Actions. **Open decision:** the Next 16 + React 19 App Router runtime alone is ~150 KB gzipped (our pages ship zero client components), so CI currently gates JS at 160 KB as a regression guard. LCP/CLS/TBT pass the original budgets.
4. **One canonical URL per page.** Absolute canonical in `generateMetadata`. No trailing slash. Lowercase slugs. Query-string variants are never indexable.
5. **Slug or category changes add a redirect** to `content/redirects.json` (applied by `next.config`). Never break a published URL.
6. **Server-only code is marked.** The content loader (`src/content/posts.ts`) and any future DB code use `import "server-only"`. Never import them into a client component.
7. **Validate at every boundary** with Zod: frontmatter (build and lint share `src/content/article.ts`), env vars (`src/env.ts`), redirects.json, route handler inputs, future DB reads.
8. **Secrets** only from env. `src/env.ts` fails the build if any are missing.
9. **No `any`.** No `// @ts-ignore`. `noUncheckedIndexedAccess: true`.
10. **Small, pure functions.** Content loading in `src/content/*`, presentation in `src/components/*`, SEO builders in `src/lib/seo/*`. One responsibility per file.
11. **Security headers** set in `next.config`: static CSP (`script-src 'self' 'unsafe-inline'` plus GA hosts; nonces would force dynamic rendering and break rule 1), HSTS, X-Content-Type-Options, Referrer-Policy `strict-origin-when-cross-origin`, Permissions-Policy.
12. **Tests before "done"** (see section 8).

## 4. SEO and AI-crawler rules

Full spec in `docs/ARCHITECTURE.md#seo`. Summary:

- `generateMetadata` on every route: title 30 to 60 chars, description 120 to 160 chars, canonical, Open Graph, Twitter card, `locale: en_IN`.
- Dynamic OG image per article via `next/og`.
- JSON-LD on every page: `Organization` + `WebSite` (site-wide), `BlogPosting` + `BreadcrumbList` + `Person` author (articles). `FAQPage` markup is allowed for semantics but Google no longer shows FAQ rich results for sites like ours, so never promise it as a ranking lever.
- `app/sitemap.ts`: only published, indexable URLs, `lastModified` from `updatedAt`. Split with `generateSitemaps` past 5,000 URLs. Include image entries. No `priority` or `changefreq` (Google ignores them).
- `app/robots.ts`: allow all search and AI crawlers listed in ARCHITECTURE.md; disallow `/api/` and `/admin/` only. Do not block query strings in robots (canonical tags handle them). Reference the sitemap.
- `/llms.txt` and `/llms-full.txt` generated from the DB. Cheap to maintain, low proven impact; do not over-invest.
- `/feed.xml` RSS 2.0.
- IndexNow ping (Bing, Yandex) on publish and update. Google gets nothing pushed; it relies on the sitemap and Search Console.
- Tag and author archive pages are `noindex, follow` until they have at least 5 substantive posts.
- Exactly one `<h1>` per page. Heading levels never skip.
- Every article links to its pillar, at least 2 sibling articles, and milnesepehle.in at most 3 times (see CONTENT_STYLE.md section 7).
- Outbound links to milnesepehle.in carry UTM params: `utm_source=verifyrishta&utm_medium=referral&utm_campaign=<post-slug>&utm_content=<placement>`.

## 5. Content rules (summary, full rules in docs/CONTENT_STYLE.md)

- **No em dashes (U+2014) and no en dashes (U+2013) anywhere in content, metadata, UI copy or these docs.** Use a full stop, comma, colon or parentheses. The content linter fails the build on them.
- Write like an experienced Indian person explaining this to a worried parent over chai: specific, calm, practical. Not like a brochure, not like an AI.
- The banned-phrase list in CONTENT_STYLE.md is enforced by `pnpm content:lint`.
- Never invent statistics, cases, quotes, laws or testimonials. Every number has a cited source or comes from real Milne Se Pehle data that Saurabh has supplied. Illustrative stories are labelled "composite example".
- Never name a detective agency, matrimonial site or individual negatively. Criticise practices, not entities.
- Legal statements (DPDP Act 2023, Bharatiya Nyaya Sanhita sections, Aadhaar rules) must be checked against the current primary source before publishing, and the article lists that source. Add "This is general information, not legal advice."
- Each article shows a real named author (with an author page) and a "Last reviewed" date.

## 6. Commands

```bash
pnpm dev                 # local dev
pnpm build               # production build (must pass with zero warnings treated as errors in CI)
pnpm typecheck           # tsc --noEmit
pnpm lint                # eslint + prettier check
pnpm test                # vitest unit tests
pnpm test:e2e            # playwright smoke + SEO assertions
pnpm content:lint <file|dir>   # style + frontmatter + MDX syntax linter (default: content/)
pnpm seo:check <url>     # fetch a live/preview URL and assert metadata, JSON-LD, canonical, h1
pnpm indexnow <url ...>  # ping IndexNow (Bing, Yandex) after a deploy that publishes/changes articles
pnpm dev:fixtures        # dev server on the test sample articles (tests/fixtures/content)
pnpm build:fixtures      # build on the sample articles (needed before pnpm test:e2e)
pnpm next analyze        # Turbopack bundle analyzer
```

No database is needed to develop, build or test. `pnpm dev` shows drafts; production builds hide them.

## 7. Content workflow

1. Create `content/articles/<slug>.mdx` with `draft: true` (frontmatter format in docs/ARCHITECTURE.md section 3). Preview with `pnpm dev`.
2. `pnpm content:lint` must pass (it also validates frontmatter and MDX syntax).
3. Saurabh reviews and edits. Nothing is published without his approval.
4. Set `draft: false`, commit and push. The deploy builds the article as static HTML.
5. Run `pnpm indexnow <url>` for new or changed articles. Git is the version history and the only content store.

## 8. Definition of done (every code task)

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass.
- New routes have a Playwright test asserting status 200, one h1, canonical, valid JSON-LD (parsed), and that main content text is present in raw HTML.
- No new client component without a comment explaining why it must be client-side.
- Lighthouse CI budget passes for affected routes.
- Commit message in Conventional Commits format.

## 9. Working agreement with Claude Code

- Saurabh is a senior engineer with 10+ years experience. Skip basics. Be direct; push back on bad ideas with reasons.
- When the user says **"design a task"**, follow `docs/TASK_DESIGN.md` exactly: break the work into tasks with token estimates before writing any code.
- Before a change touching more than 3 files, state the plan in 5 lines or fewer and wait for "go".
- Prefer editing existing files over creating new ones. Do not add dependencies without stating size and reason.
- Never commit `.env*` files. Never print secrets.
- When unsure about a fact in content (law, statistic, process), say so and ask. Do not guess.

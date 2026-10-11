# "Design a task" protocol

When Saurabh says **"design a task"** (or "design tasks for X"), do not write code. Produce a task breakdown in the format below, then wait for approval.

## Output format

1. **Goal** in one sentence.
2. **Assumptions** (max 5 bullets). Flag anything that needs a decision.
3. **Task table:**

| ID | Task | Files touched | Depends on | Est. input tokens | Est. output tokens | Est. total | Suggested model tier | Risk |
|---|---|---|---|---|---|---|---|---|

4. **Total estimate** with a range (low to high).
5. **Order of execution** and which tasks can run in parallel.
6. **What could blow the estimate** (1 to 3 bullets).

## How to estimate tokens

Estimates are rough. State them as ranges and round to the nearest 5k. Be honest; do not under-quote to look efficient.

- **Input tokens** = everything read into context during the task: CLAUDE.md (~3k), relevant docs (~2k to 5k each), files read (roughly characters / 4), tool results (build logs, test output), plus context re-sent on every turn. In an agentic session, input grows with each turn, so a 10-turn task re-reads its growing context 10 times. Rule of thumb: input = (base context + files read) x (number of turns / 2).
- **Output tokens** = code and text written. Roughly 10 to 12 tokens per line of TypeScript, about 1.3 tokens per English word.
- **Add 30% buffer** for debugging loops (failed builds, type errors, test fixes).

## Model tier guidance

| Tier | Use for |
|---|---|
| Small / fast | Mechanical edits, renames, adding tests for existing code, frontmatter fixes, lint fixes |
| Mid | Most feature work: routes, components, scripts, CI config, first drafts of articles |
| Largest | Architecture decisions, tricky bugs (caching, ISR, middleware), legal-sensitive content review, pillar pages |

## Reference estimates for this project (calibrate after each real task)

| Task | Typical total tokens |
|---|---|
| Scaffold Next.js + TS strict + Tailwind + ESLint/Prettier + env validation | 40k to 80k |
| Content layer: MDX loader, frontmatter schema, registries | 30k to 60k |
| Markdown pipeline with directives, TOC, sanitisation + unit tests | 60k to 120k |
| Article route (static params, ISR, metadata, JSON-LD, components) | 60k to 120k |
| Sitemap + robots + RSS + llms.txt + OG image route | 50k to 90k |
| Middleware (host, slash, case, redirects) + tests | 25k to 50k |
| `content:lint` script (dashes, banned phrases, readability, links) | 25k to 50k |
| IndexNow + publish workflow | 15k to 30k |
| CI workflow with Playwright SEO checks and Lighthouse budgets | 40k to 90k |
| One cluster article draft (1,500 to 2,000 words) from a brief, no web research | 20k to 40k |
| Same article with web research for sources | 50k to 120k |
| Pillar page (3,000+ words) with research | 100k to 200k |
| Review + edit pass on one article against CONTENT_STYLE.md | 15k to 30k |

After finishing a task, if the real usage was far off, update this table.

## Example

> design a task: add the RSS feed

| ID | Task | Files | Depends | In | Out | Total | Tier | Risk |
|---|---|---|---|---|---|---|---|---|
| T1 | Query: list last 50 published posts (no body) | `src/content/posts.ts` | none | 8k | 1k | 10k | Small | Low |
| T2 | Route handler `/feed.xml`, RSS 2.0, cached with tag `sitemap` | `src/app/feed.xml/route.ts` | T1 | 10k | 2k | 15k | Mid | Low |
| T3 | Link `<link rel="alternate">` in root layout | `src/app/layout.tsx` | T2 | 5k | 0.5k | 5k | Small | Low |
| T4 | Playwright test: valid XML, 200, correct content-type | `tests/e2e/feed.spec.ts` | T2 | 8k | 1.5k | 10k | Small | Low |

Total: 40k (range 30k to 55k). T1 then T2, T3 and T4 in parallel. Risk: XML escaping of Hindi titles.

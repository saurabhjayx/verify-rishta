# Plan - VerifyRishta

## 1. Positioning

VerifyRishta answers one family of questions better than anyone: "How do we make sure this rishta is what it claims to be, without hiring a detective or insulting the other family?"

It is an education site run openly by the Milne Se Pehle team. It sends readers to milnesepehle.in when they are ready to act.

### Honest constraints (read before planning anything)
- **A brand-new domain has no authority.** Expect 3 to 6 months before meaningful Google traffic and 6 to 12 months before it sends material signups. Links from a new site pass little ranking value to MSP early on. The value is the readers it converts, not the backlinks.
- **The niche is small.** Search volume for "marriage background verification" style queries in India is modest, and detective agencies already target the obvious keywords. We win on long-tail, question-shaped, parent-language queries (English and Hindi) and on AI-assistant citations.
- **Validate volumes before writing.** Use Google Search Console data from milnesepehle.in, Google Keyword Planner, and Search Console of this site once live. No keyword volumes in this doc are assumed.
- **Content quality is the whole game.** 30 genuinely useful articles beat 200 thin ones. Scaled low-value content is exactly what Google's spam policies target.

## 2. Topic clusters (URL prefix = cluster slug)

| Cluster slug | Pillar page | Audience | Funnel |
|---|---|---|---|
| `marriage-verification-basics` | Marriage background verification in India: the complete guide | Both | TOFU |
| `matrimonial-fraud` | Matrimonial fraud in India: types, red flags and what to do | Both | TOFU |
| `detective-vs-self-verification` | Detective agencies vs consent-based self-verification | Parents | MOFU |
| `for-parents` | A parent's guide to checking a rishta respectfully | Parents | MOFU |
| `documents-and-records` | Which documents prove what, and how to check them | Both | MOFU |
| `nri-marriages` | Marrying an NRI: what to verify and how | Both | MOFU |
| `milne-se-pehle` | How Milne Se Pehle verification works | Both | BOFU |

## 3. Seed article list (first 30, prioritise in this order)

### Wave 1: foundation (publish within first 4 weeks)
1. Pillar: Marriage background verification in India: the complete guide
2. What does pre-matrimonial verification actually check?
3. Is marriage background verification legal in India? (DPDP Act, consent)
4. Detective agency vs self-verification: an honest comparison
5. Pillar: Matrimonial fraud in India: types, red flags and what to do
6. 12 red flags in a matrimonial profile (with what to ask instead)
7. How to ask the other family for verification without offending them (with sample WhatsApp messages)
8. How Milne Se Pehle verification works (Parichay, Vishwas, Bandhan explained)
9. What to do if you discover fraud after the roka or engagement
10. About / Editorial policy / Disclosure pages (not articles, but needed for trust)

### Wave 2: depth (weeks 5 to 10)
11. How to verify a groom's job and salary
12. How to verify education degrees in India
13. How to check if someone is already married or divorced
14. Fake NRI grooms: how the scam works and how to verify
15. Matrimonial site scams: fake profiles, money requests, and the pattern behind them
16. What a marriage bureau checks (and what it does not)
17. How much does pre-matrimonial verification cost in India?
18. DigiLocker for families: what can and cannot be shared
19. Kundli matching vs background verification: different questions
20. Why so many families now verify before marriage (data-led, sourced)

### Wave 3: long-tail and Hindi (weeks 11 to 20)
21 to 30. Driven by Search Console queries from waves 1 and 2, plus Hindi versions of the 5 best performers (human-reviewed translation, `/hi/` path).

## 4. Phases

### Phase 0: setup (1 to 2 days, mostly Saurabh)
- DNS: apex canonical, `www` redirect, Cloudflare in front.
- Google Search Console (domain property) and Bing Webmaster Tools.
- Decide author identity: Saurabh as author, real photo, LinkedIn link. Find one legal reviewer if possible.
- Pull Search Console query data from milnesepehle.in to seed real query language.
- Collect 10 to 15 real, anonymised insights from MSP verifications (patterns, mismatch rates, common questions). This is the content moat.

### Phase 1: foundation build (code)
- Scaffold, env, DB layer, schemas.
- Markdown pipeline with directives.
- Routes: home, cluster, article, author, static pages, 404.
- SEO: metadata builders, JSON-LD, sitemap, robots, RSS, llms.txt, OG images.
- Middleware: host, slash, case, redirects.
- Scripts: `content:lint`, `seo:check`, `indexnow`. Articles are `.mdx` files in git (no database for content).
- CI with Lighthouse budgets and Playwright SEO assertions.
- Design: clean, readable, mobile-first. Body text 18px, line length 65 to 75 characters, high contrast. Trust signals: author box, last reviewed date, sources, disclosure.

### Phase 2: content wave 1 and launch
- Write and publish wave 1 (articles 1 to 10).
- Submit sitemap. Request indexing for pillars.
- Link to VerifyRishta from milnesepehle.in (footer "Learn" link, relevant MSP pages). One-way, natural.
- Share pillars in the WhatsApp communities and with partner marriage bureaus (doubles as a distribution channel for MSP itself).

### Phase 3: growth
- Waves 2 and 3.
- Newsletter (double opt-in) for parents.
- Hindi section with hreflang.
- Simple admin UI for editing posts (only if editing through markdown and git becomes a bottleneck).
- Content refresh loop: every 90 days review the top 20 posts, update facts, bump `lastReviewedAt` and `updatedAt` only if content changed.
- Earn links: offer data-led pieces ("what we found in N verifications") to journalists who covered MSP before.

## 5. KPIs

| Metric | Source | Month 3 signal | Month 6 signal |
|---|---|---|---|
| Indexed pages / published pages | Search Console | > 80% | > 90% |
| Impressions | Search Console | Growing week over week | Measured, set targets from month 3 baseline |
| Avg position for pillar queries | Search Console | Top 30 | Top 10 for long-tail |
| Clicks to milnesepehle.in | GA4 `msp_click` + MSP UTM reports | Tracked per article | Set target from baseline |
| MSP signups attributed | MSP analytics (utm_source=verifyrishta) | Any | Set target from baseline |
| Core Web Vitals | Search Console CWV report | All "Good" | All "Good" |

Targets are set from real baselines, not guessed now.

## 6. Kill or pivot criteria

Review at month 6. If indexed coverage is healthy, content is good, and impressions are still flat, move the best articles to `milnesepehle.in/learn/` with 301s and stop running two domains. Running one strong domain is better than two weak ones.

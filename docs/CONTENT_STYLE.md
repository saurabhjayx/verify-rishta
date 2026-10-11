# Content Style Guide - VerifyRishta

The goal is not "content that passes AI detectors". The goal is content a worried parent in Indore or a groom's sister in Pune reads to the end, trusts, and shares on the family WhatsApp group. Google rewards the same thing: first-hand experience, specifics, and clear answers. Detector-evasion tricks (random typos, forced slang) make content worse. Do not do them.

Our unfair advantage over every other site on this topic: Milne Se Pehle has done real verifications. Real patterns, real mismatches found, real questions families ask. Every article should use at least one piece of that experience (supplied by Saurabh, never invented).

---

## 1. Hard rules (enforced by `pnpm content:lint`)

1. **No em dash (U+2014) and no en dash (U+2013).** Not in body, title, meta, alt text, FAQ, or UI. Use a full stop, comma, colon or brackets. A hyphen inside compound words (`pre-matrimonial`, `self-verification`) is fine.
2. **No banned phrases** (section 3). Case-insensitive.
3. **Paragraphs max 4 sentences.** Most should be 1 to 3.
4. **Sentence length varies.** Linter flags 4+ consecutive sentences within 4 words of each other in length.
5. **Every statistic has a source** in `sources` frontmatter, or is marked as MSP data.
6. **Answer first.** The first 2 to 3 sentences under the H1 directly answer the main question in plain words. This is what Google snippets and AI assistants quote.
7. **Max 3 links to milnesepehle.in per article**, at least 2 internal links to sibling posts, 1 link to the pillar.
8. **Readability:** target Flesch reading ease 55 to 70 for English. Indian readers often read English as a second language. Short words win.

## 2. Voice

- **Who is talking:** the Milne Se Pehle team. "We" is fine. Speak as people who have seen hundreds of these cases, not as a faceless brand.
- **To whom:** usually parents (45 to 65) or the bride/groom (25 to 35). State in the brief which one. Write to one person.
- **Tone:** calm, warm, a little blunt. Never fear-mongering. Fraud is real, but most families are honest; verification is about confidence, not suspicion.
- **Indian context, naturally:** rishta, biodata, kundli, shaadi, NRI, "the boy's side", "the girl's family", WhatsApp forwards, marriage bureau, matchmaker auntie. Use these where a real person would. Do not stuff Hinglish for flavour.
- **Specific beats general.** Not "verify employment". Instead: "Ask for the last three salary slips and the offer letter, then check that the company name on both matches the LinkedIn profile and the MCA company register."
- **Admit trade-offs and limits.** Say what self-verification cannot catch. Say when a detective agency or a lawyer is actually the right call. Honest limits are what make the recommendation believable.

## 3. Banned phrases and patterns

Words and phrases:
delve, delving, tapestry, landscape (metaphorical), navigate / navigating (metaphorical), realm, embark, journey (metaphorical), unlock, unleash, empower, elevate, leverage, robust, seamless, seamlessly, crucial, pivotal, paramount, vital role, plays a key role, multifaceted, holistic, foster, plethora, myriad, testament, game-changer, cutting-edge, ever-evolving, in today's fast-paced world, in today's digital age, in the modern era, it's important to note, it is worth noting, it's no secret, needless to say, furthermore, moreover, additionally (as sentence opener), in conclusion, to sum up, at the end of the day, look no further, rest assured, peace of mind (max once per site section, it is our category's cliche), dive into, deep dive, let's explore, buckle up, whether you're X or Y, not only X but also Y (max once per article).

Patterns:
- Rule-of-three lists in every paragraph ("safe, secure, and simple").
- Rhetorical question followed immediately by its answer as a fragment ("The result? Peace of mind.").
- Ending sections with a one-line moral.
- Headings that are puns or "The Ultimate Guide to...".
- Generic intros that restate the title. Start with a scene, a number, or the answer.
- Emoji in body text.

## 4. Article structure (template)

File: `content/articles/<slug>.mdx` (MDX: Markdown plus optional JSX; escape a literal `<` or `{` as `&lt;` / `\{`).

```mdx
---
title: "What Is Marriage Background Verification, and What Does It Check?"
slug: "what-is-marriage-background-verification"
description: "What pre-matrimonial verification checks, how it works in India, what it costs, and how to ask for it without offending the other family."
publishedAt: "2026-10-11"
updatedAt: "2026-10-11"
author: "Verify Rishta Editorial Team"     # or a named author from src/content/authors.ts
category: "Marriage verification basics"  # a topic from src/content/categories.ts
draft: true                               # false when Saurabh approves
seoTitle: "Marriage Background Verification in India Explained"   # needed: title > 60 chars
excerpt: "A plain-language guide to what gets verified before a wedding in India and how families do it legally."
reviewer: ""                              # add legal reviewer when available
tags: [basics, parents]
audience: parents                         # parents | bride-groom | both
primaryQuery: marriage background verification
secondaryQueries: [pre matrimonial verification, verify groom before marriage]
sources:
  - { title: "...", url: "...", publisher: "...", accessed: "2026-10-11" }
faqs:
  - { q: "...", a: "..." }
---

# What Is Marriage Background Verification, and What Does It Check?

Answer in 2 to 3 plain sentences.

A short real-feeling scene (composite, labelled) or a hard fact that shows why this matters.

## Question-shaped H2 (what a parent would type or ask)
...

:::experience
What we see at Milne Se Pehle: <real pattern or number supplied by Saurabh>.
:::

## ...

:::msp-cta{placement="mid"}
:::

## What verification cannot tell you
(honest limits)

FAQs (3 to 6, each answer 2 to 4 sentences, standalone) go in frontmatter `faqs`,
never as a body heading. Sources and the legal disclaimer are rendered from frontmatter.
```

Length: pillar pages 2,500 to 4,000 words. Cluster articles 1,200 to 2,200 words. Length follows the question, never padding.

## 5. Legal and ethical guardrails

- **Laws change.** India replaced the IPC with the Bharatiya Nyaya Sanhita (BNS) from 1 July 2024. Always cite the current BNS section and, where useful for readers who know the old number, the old IPC section. Verify each section number against the official text before publishing.
- **DPDP Act 2023:** check the current status of the DPDP Rules before writing about consent, data retention or penalties. Link the primary source (MeitY / India Code).
- **Aadhaar:** never advise collecting or storing full Aadhaar numbers. Mention masked Aadhaar and DigiLocker-based sharing.
- **Fraud help:** National Cyber Crime Helpline 1930 and https://cybercrime.gov.in. For NRI marriage issues, link the Ministry of External Affairs guidance. Re-check links quarterly.
- **No naming and shaming** of agencies, platforms, or people. Criticise practices.
- **No fabricated testimonials, reviews or case studies.** Composite stories are allowed only inside `:::composite` and are labelled as such.
- **Sensitive topics** (dowry, domestic violence, caste): handle factually, link to official help resources, never trivialise. Do not frame verification as checking caste.
- **Disclosure:** articles that recommend Milne Se Pehle say plainly that VerifyRishta is published by the Milne Se Pehle team.

## 6. E-E-A-T checklist (every article)

- [ ] Named author with author page and LinkedIn `sameAs`.
- [ ] At least one first-hand MSP insight (real, supplied).
- [ ] Primary sources linked for laws, statistics and official processes.
- [ ] "Last reviewed" date shown and stored.
- [ ] Honest limits section.
- [ ] Not legal advice disclaimer where law is discussed.

## 7. Linking to Milne Se Pehle

- Natural, varied anchors. Mostly brand ("Milne Se Pehle") or descriptive ("how our verification certificate works"). Never repeat the same exact-match keyword anchor across posts.
- Placements: one contextual in body, one `:::msp-cta` block mid or end, optionally one in the author box. Max 3.
- Every link gets UTMs automatically from the markdown pipeline. Do not hand-write UTMs.
- Bottom-of-funnel articles (pricing, how it works, comparisons) can lead with MSP. Top-of-funnel articles (fraud types, red flags) must be useful even for a reader who never clicks.
- **Neutral, not an advert.** The site promotes MSP only by being genuinely useful. Never present MSP as the only option: whenever MSP is suggested, name the alternatives (self-verification, a lawyer, official portals, other services) and say MSP is ours. No MSP link or CTA before the first H2 (`pnpm content:lint` rule `msp-in-answer`). Comparisons state what MSP does not do. No superlatives about MSP ("best", "most trusted", "only").

## 8. Self-review before handing a draft to Saurabh

1. Read the first 3 sentences alone. Do they answer the question?
2. Search the draft for every number. Is each sourced or marked MSP data?
3. Would a 55-year-old parent understand every sentence on first read?
4. Is there one paragraph that sounds like a brochure? Rewrite it as you would say it out loud.
5. Run `pnpm content:lint`. Fix, do not suppress.

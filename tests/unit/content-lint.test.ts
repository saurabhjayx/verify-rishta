import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { lintMarkdown, type Issue } from "@/lib/content-lint/lint";
import { fleschReadingEase, splitSentences } from "@/lib/content-lint/text";

const fixture = (name: string) =>
  readFile(`tests/fixtures/content-lint/${name}`, "utf8");
const errorRules = (issues: Issue[]) =>
  new Set(issues.filter((i) => i.severity === "error").map((i) => i.rule));

// Valid frontmatter (exactly 10 fields, so the body starts on line 14); tests vary only the body.
const FRONTMATTER = `---
title: Inline test title that is long enough
slug: inline-test
description: ${"An inline test description that needs to be long enough to pass the frontmatter schema check. ".repeat(2).slice(0, 140)}
publishedAt: 2026-10-10
author: Verify Rishta Editorial Team
category: for-parents
excerpt: Inline test.
audience: parents
primaryQuery: inline test
lastReviewedAt: 2026-10-10
---
`;
const lintBody = (body: string) =>
  lintMarkdown(`${FRONTMATTER}\n${body}\n`, "content/articles/inline-test.mdx");
const lintFixture = async (name: string) =>
  lintMarkdown(await fixture(name), `tests/fixtures/content-lint/${name}`);

describe("lintMarkdown fixtures", () => {
  it("passes a clean article (with a leading # title) with no errors or warnings", async () => {
    expect(await lintFixture("lint-pass-fixture.mdx")).toEqual([]);
  });

  it("reports every rule the failing fixture breaks", async () => {
    const rules = errorRules(await lintFixture("lint-fail-fixture.mdx"));
    expect([...rules].sort()).toEqual(
      [
        "banned-phrase",
        "capped-phrase",
        "faq-in-body",
        "frontmatter",
        "heading-skip",
        "image-alt",
        "msp-links",
        "no-dashes",
        "no-emoji",
        "no-h1",
        "paragraph-length",
        "unknown-directive",
        "unsourced-number",
      ].sort(),
    );
  });

  it("passes every real article and test fixture without errors", async () => {
    for (const dir of ["content/articles", "tests/fixtures/content/articles"]) {
      for (const name of (await readdir(dir)).filter((f) =>
        f.endsWith(".mdx"),
      )) {
        const issues = lintMarkdown(
          await readFile(`${dir}/${name}`, "utf8"),
          `${dir}/${name}`,
        );
        expect(
          issues.filter((i) => i.severity === "error"),
          name,
        ).toEqual([]);
      }
    }
  });
});

describe("lintMarkdown rules", () => {
  it("fails on U+2014 and U+2013 with the right line", () => {
    const issues = lintBody("Fine line.\n\nBad — line.\n\nAlso bad – here.");
    expect(
      issues.filter((i) => i.rule === "no-dashes").map((i) => i.line),
    ).toEqual([16, 18]);
  });

  it("reports body (mdast) issues on the right file line", () => {
    const issues = lintBody("Fine line.\n\nAbout 40% are fake.");
    expect(issues.find((i) => i.rule === "unsourced-number")?.line).toBe(16);
  });

  it("allows hyphens in compound words", () => {
    expect(
      errorRules(lintBody("Pre-matrimonial self-verification is fine.")),
    ).toEqual(new Set());
  });

  it("matches banned phrases case-insensitively, with curly apostrophes, but not inside URLs", () => {
    expect(errorRules(lintBody("It’s Important To Note this."))).toContain(
      "banned-phrase",
    );
    expect(
      errorRules(
        lintBody("See [this guide](https://example.org/robust-landscape)."),
      ),
    ).not.toContain("banned-phrase");
    expect(errorRules(lintBody("Additionally, check this."))).toContain(
      "banned-phrase",
    );
    expect(errorRules(lintBody("Check this additionally."))).not.toContain(
      "banned-phrase",
    );
  });

  it("allows one 'not only X but also Y', even when two share a sentence", () => {
    expect(
      errorRules(lintBody("It is not only fast but also cheap.")),
    ).not.toContain("capped-phrase");
    expect(
      errorRules(
        lintBody(
          "Not only fast but also cheap, and not only safe but also kind.",
        ),
      ),
    ).toContain("capped-phrase");
  });

  it("allows one 'peace of mind' but not two", () => {
    expect(errorRules(lintBody("It gives peace of mind."))).not.toContain(
      "capped-phrase",
    );
    expect(
      errorRules(lintBody("Peace of mind.\n\nMore peace of mind.")),
    ).toContain("capped-phrase");
  });

  it("counts sentences per paragraph, ignoring abbreviations", () => {
    expect(errorRules(lintBody("One. Two. Three. Four."))).not.toContain(
      "paragraph-length",
    );
    expect(errorRules(lintBody("One. Two. Three. Four. Five."))).toContain(
      "paragraph-length",
    );
    expect(
      errorRules(lintBody("Ask for papers, e.g. slips. Two. Three. Four.")),
    ).not.toContain("paragraph-length");
  });

  it("needs a link or footnote in any sentence with a digit, except inside :::experience", () => {
    expect(errorRules(lintBody("About 40% of profiles are fake."))).toContain(
      "unsourced-number",
    );
    expect(
      errorRules(
        lintBody(
          "About 40% are fake, says [this report](https://example.org).",
        ),
      ),
    ).not.toContain("unsourced-number");
    expect(
      errorRules(
        lintBody(
          "About 40% are fake.[^1]\n\n[^1]: [Report](https://example.org)",
        ),
      ),
    ).not.toContain("unsourced-number");
    expect(
      errorRules(lintBody(":::experience\nWe saw 40% mismatches.\n:::")),
    ).not.toContain("unsourced-number");
    expect(errorRules(lintBody(":::composite\nShe was 28.\n:::"))).toContain(
      "unsourced-number",
    );
  });

  it("caps milnesepehle.in at 3, counting :::msp-cta blocks", () => {
    const three =
      '[a](https://milnesepehle.in/) [b](https://www.milnesepehle.in/x)\n\n:::msp-cta{placement="end"}\n:::';
    expect(errorRules(lintBody(three))).not.toContain("msp-links");
    expect(
      errorRules(lintBody(`${three}\n\n[c](https://milnesepehle.in/y)`)),
    ).toContain("msp-links");
  });

  it("keeps Milne Se Pehle out of the opening answer", () => {
    expect(
      errorRules(
        lintBody("Answer with [MSP](https://milnesepehle.in/).\n\n## Next"),
      ),
    ).toContain("msp-in-answer");
    expect(
      errorRules(lintBody(':::msp-cta{placement="mid"}\n:::\n\n## Next')),
    ).toContain("msp-in-answer");
    expect(
      errorRules(
        lintBody(
          "Answer first.\n\n## Next\n\nSee [MSP](https://milnesepehle.in/).",
        ),
      ),
    ).not.toContain("msp-in-answer");
  });

  it("allows only a leading # heading that matches the title", () => {
    expect(
      errorRules(lintBody("# Inline test title that is long enough\n\nIntro.")),
    ).not.toContain("no-h1");
    expect(errorRules(lintBody("# Some other title\n\nIntro."))).toContain(
      "no-h1",
    );
    expect(errorRules(lintBody("Intro.\n\n# Late H1"))).toContain("no-h1");
  });

  it("reports invalid MDX instead of crashing", () => {
    expect(errorRules(lintBody("Costs are <5% of the budget."))).toContain(
      "mdx-syntax",
    );
  });

  it("warns, but does not fail, on missing pillar and sibling links", () => {
    const issues = lintBody("Plain text with no links at all.");
    expect(issues.map((i) => i.rule)).toEqual(
      expect.arrayContaining(["pillar-link", "sibling-links"]),
    );
    expect(issues.every((i) => i.severity === "warning")).toBe(true);
  });
});

describe("text helpers", () => {
  it("splits sentences", () => {
    expect(splitSentences("One here. Two there! Three? e.g. four.")).toEqual([
      "One here.",
      "Two there!",
      "Three? e.g. four.",
    ]);
  });

  it("scores simple text as easier than complex text", () => {
    expect(fleschReadingEase(["The cat sat on the mat."])).toBeGreaterThan(
      fleschReadingEase([
        "Comprehensive verification methodologies necessitate institutional collaboration.",
      ]),
    );
  });
});

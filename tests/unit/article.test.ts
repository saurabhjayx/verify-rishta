import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { checkArticle } from "@/content/article";

const FILE = "content/articles/sample-article.mdx";
const frontmatter = (extra = "") => `---
title: "Hidden Red Flags Before Marriage"
slug: "sample-article"
description: "Learn how to identify warning signs before making a marriage commitment, and which questions to ask the other family before anything is fixed."
publishedAt: "2026-10-11"
updatedAt: "2026-10-11"
author: "Verify Rishta Editorial Team"
category: "Matrimonial fraud"
draft: false
${extra}---

Body.
`;

describe("checkArticle", () => {
  it("accepts the owner's frontmatter format and resolves names to registry entries", () => {
    const { article, problems } = checkArticle(frontmatter(), FILE);
    expect(problems).toEqual([]);
    expect(article?.author.slug).toBe("verify-rishta-editorial-team");
    expect(article?.category.slug).toBe("matrimonial-fraud");
    expect(article?.frontmatter.publishedAt).toBeInstanceOf(Date);
    expect(article?.frontmatter.draft).toBe(false);
  });

  it.each([
    [
      "unknown category",
      frontmatter().replace('"Matrimonial fraud"', '"Marriage Guidance"'),
      /category "Marriage Guidance"/,
    ],
    [
      "unknown author",
      frontmatter().replace('"Verify Rishta Editorial Team"', '"Someone Else"'),
      /author "Someone Else"/,
    ],
    [
      "file name not matching slug",
      frontmatter(),
      /must be named sample-article\.mdx/,
      "content/articles/other.mdx",
    ],
    [
      "short description",
      frontmatter().replace(/description: ".*"/, 'description: "Too short."'),
      /description/,
    ],
    ["typo in a key", frontmatter("titel: x\n"), /titel|Unrecognized/],
    [
      "title too long without seoTitle",
      frontmatter().replace(
        '"Hidden Red Flags Before Marriage"',
        `"${"Long title ".repeat(7)}"`,
      ),
      /seoTitle/,
    ],
    [
      "non-WebP hero image",
      frontmatter(
        'heroImage: { src: "/a.png", alt: "a", width: 1, height: 1 }\n',
      ),
      /WebP/,
    ],
  ])("rejects %s", (_, raw, message, file = FILE) => {
    const { article, problems } = checkArticle(raw, file);
    expect(article).toBeUndefined();
    expect(problems.join("\n")).toMatch(message);
  });

  it("accepts every real article and every fixture", async () => {
    for (const dir of ["content/articles", "tests/fixtures/content/articles"]) {
      for (const file of (await readdir(dir)).filter((f) =>
        f.endsWith(".mdx"),
      )) {
        const { problems } = checkArticle(
          await readFile(`${dir}/${file}`, "utf8"),
          `${dir}/${file}`,
        );
        expect(problems, file).toEqual([]);
      }
    }
  });
});

import { run } from "@mdx-js/mdx";
import { createElement } from "react";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compileArticle } from "@/lib/markdown/compile";
import { withMspUtm } from "@/lib/seo/utm";

/** Compile, then render the same way ArticleContent does. */
async function render(mdx: string) {
  const compiled = await compileArticle(mdx, { slug: "test-post" });
  const { default: Content } = await run(compiled.code, {
    ...runtime,
    baseUrl: import.meta.url,
  });
  return { ...compiled, html: renderToStaticMarkup(createElement(Content)) };
}

describe("compileArticle", () => {
  it("strips a leading # title, gives headings plain ids and collects the TOC", async () => {
    const { html, toc } = await render(
      "# The title\n\nIntro.\n\n## Is it legal?\n\ntext\n\n### Consent\n\nmore\n\n#### Deep\n",
    );
    expect(html).not.toContain("<h1");
    expect(html).toContain('<h2 id="is-it-legal">');
    expect(toc).toEqual([
      { id: "is-it-legal", text: "Is it legal?", level: 2 },
      { id: "consent", text: "Consent", level: 3 },
    ]);
  });

  it("renders all four directives as asides", async () => {
    const { html } = await render(
      [
        ':::callout{type="warning"}\nRed flag.\n:::',
        ":::experience\nReal pattern.\n:::",
        ":::composite\nA story.\n:::",
        ':::msp-cta{placement="mid"}\n:::',
      ].join("\n\n"),
    );
    expect(html).toContain('<aside class="callout callout-warning">');
    expect(html).toContain(
      '<aside class="experience"><p class="directive-label">What we see at Milne Se Pehle</p>',
    );
    expect(html).toContain('<p class="directive-label">Composite example</p>');
    expect(html).toContain('<aside class="msp-cta" data-placement="mid">');
    expect(html).toContain("utm_content=mid");
  });

  it("rejects unknown directives and bad attributes", async () => {
    await expect(render(":::warning\nx\n:::")).rejects.toThrow(
      /unknown directive :::warning/,
    );
    await expect(render(":::msp-cta\n:::")).rejects.toThrow(/placement/);
    await expect(render(':::callout{type="danger"}\nx\n:::')).rejects.toThrow(
      /callout type/,
    );
  });

  it("keeps text that only looks like a directive", async () => {
    const { html } = await render("Note:this matters at 10:30.");
    expect(html).toContain("<p>Note:this matters at 10:30.</p>");
  });

  it("adds UTMs to milnesepehle.in links and rel=noopener to external links", async () => {
    const { html } = await render(
      "[MSP](https://milnesepehle.in/pricing?utm_source=x) and [India Code](https://www.indiacode.nic.in/) and [home](/about)",
    );
    expect(html).toContain(
      'href="https://milnesepehle.in/pricing?utm_source=verifyrishta&amp;utm_medium=referral&amp;utm_campaign=test-post&amp;utm_content=inline" rel="noopener"',
    );
    expect(html).toContain(
      'href="https://www.indiacode.nic.in/" rel="noopener"',
    );
    expect(html).toContain('<a href="/about">home</a>');
  });

  it("supports MDX JSX and fails loudly on invalid MDX", async () => {
    const { html } = await render(
      '<abbr title="Non-Resident Indian">NRI</abbr> grooms',
    );
    expect(html).toContain('<abbr title="Non-Resident Indian">NRI</abbr>');
    await expect(render("Costs are <5% of the budget")).rejects.toThrow();
  });

  it("keeps footnote links and targets in sync", async () => {
    const { html } = await render(
      "A fact.[^1]\n\n[^1]: [Source](https://example.org)",
    );
    const href = /href="#([^"]+)"[^>]*data-footnote-ref/.exec(html)?.[1];
    expect(href).toBeDefined();
    expect(html).toContain(`id="${href}"`);
  });

  it("lazy-loads body images", async () => {
    const { html } = await render("![Alt text](/images/a.webp)");
    expect(html).toContain('loading="lazy"');
  });

  it("counts words without injected CTA copy", async () => {
    const { wordCount, readingMinutes } = await render(
      `one two three\n\n:::msp-cta{placement="end"}\n:::`,
    );
    expect(wordCount).toBe(3);
    expect(readingMinutes).toBe(1);
  });
});

describe("withMspUtm", () => {
  it("sets the four UTM params", () => {
    const url = new URL(
      withMspUtm("https://milnesepehle.in/", "slug-a", "end"),
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_source: "verifyrishta",
      utm_medium: "referral",
      utm_campaign: "slug-a",
      utm_content: "end",
    });
  });
});

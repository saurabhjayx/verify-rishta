import matter from "gray-matter";
import type { Heading, Nodes, Paragraph, PhrasingContent, Root } from "mdast";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visitParents } from "unist-util-visit-parents";
import { isMspUrl } from "@/lib/seo/utm";
import { checkArticle } from "@/content/article";
import { BANNED, CAPPED } from "./banned";
import { CITE, fleschReadingEase, splitSentences, words } from "./text";

export type Issue = {
  line: number;
  severity: "error" | "warning";
  rule: string;
  message: string;
};

const MAX_SENTENCES_PER_PARAGRAPH = 4;
const MAX_MSP_LINKS = 3;
const MIN_FLESCH = 55;
const KNOWN_DIRECTIVES = new Set([
  "msp-cta",
  "callout",
  "experience",
  "composite",
]);

/** Flattens a paragraph to text, appending CITE after links and footnote refs. */
function flatten(nodes: PhrasingContent[]): string {
  return nodes
    .map((node): string => {
      switch (node.type) {
        case "text":
        case "inlineCode":
          return node.value;
        case "link":
          return `${flatten(node.children)}${CITE}`;
        case "footnoteReference":
          return CITE;
        case "image":
          return node.alt ?? "";
        case "break":
          return " ";
        default:
          return "children" in node
            ? flatten(node.children as PhrasingContent[])
            : "";
      }
    })
    .join("");
}

const hasAncestorDirective = (ancestors: Nodes[], name: string) =>
  ancestors.some((a) => a.type === "containerDirective" && a.name === name);

// Strip URLs so banned words inside slugs or links do not count.
const visibleText = (line: string) =>
  line.replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, "");

/** Lints one markdown article against docs/CONTENT_STYLE.md. */
/** Lints one .mdx article. `filePath` is checked against the slug. */
export function lintMarkdown(raw: string, filePath: string): Issue[] {
  const issues: Issue[] = [];
  const add = (
    line: number,
    severity: Issue["severity"],
    rule: string,
    message: string,
  ) => issues.push({ line, severity, rule, message });
  const lines = raw.split("\n");

  // 1. Dashes and banned phrases: whole file, including frontmatter.
  lines.forEach((text, i) => {
    if (/[–—]/.test(text))
      add(
        i + 1,
        "error",
        "no-dashes",
        "em/en dash: use a full stop, comma, colon or brackets",
      );
    const visible = visibleText(text).replaceAll("’", "'");
    for (const { name, pattern } of BANNED) {
      if (visible.match(pattern))
        add(i + 1, "error", "banned-phrase", `"${name}"`);
    }
  });
  const fullText = lines.map(visibleText).join("\n").replaceAll("’", "'");
  for (const { name, pattern, max } of CAPPED) {
    const count = fullText.match(pattern)?.length ?? 0;
    if (count > max)
      add(
        1,
        "error",
        "capped-phrase",
        `"${name}" used ${count} times (max ${max})`,
      );
  }

  // 2. Frontmatter: same rules as the build (src/content/article.ts).
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (error) {
    add(
      1,
      "error",
      "frontmatter",
      `YAML does not parse: ${(error as Error).message}`,
    );
    return issues;
  }
  const { article, problems } = checkArticle(raw, filePath);
  for (const problem of problems) add(1, "error", "frontmatter", problem);
  const offset =
    raw.slice(0, raw.length - parsed.content.length).split("\n").length - 1;
  const lineOf = (node: Nodes) => (node.position?.start.line ?? 1) + offset;

  // 3. Body structure. remark-mdx: invalid MDX (e.g. a bare "<" or "{") fails here, not at deploy.
  let tree: Root;
  try {
    tree = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .use(remarkDirective)
      .parse(parsed.content) as Root;
  } catch (error) {
    const place = (error as { line?: number }).line;
    add((place ?? 1) + offset, "error", "mdx-syntax", (error as Error).message);
    return issues.sort((a, b) => a.line - b.line);
  }
  const title = article?.frontmatter.title;
  const firstNode = tree.children[0];
  const sentences: { text: string; line: number }[] = [];
  let mspLinks = 0;
  let previousLevel = 1;
  let seenH2 = false;
  const internalLinks: string[] = [];

  visitParents(tree, (node, ancestors) => {
    switch (node.type) {
      case "heading": {
        const heading = node as Heading;
        const text = flatten(heading.children).trim();
        // A leading "# <title>" is allowed (it is stripped at render); any other H1 is not.
        if (heading.depth === 1 && !(node === firstNode && text === title))
          add(
            lineOf(node),
            "error",
            "no-h1",
            node === firstNode
              ? "a leading # heading must match the frontmatter title exactly"
              : "only one H1 (the title); start sections at ##",
          );
        else if (heading.depth > previousLevel + 1)
          add(
            lineOf(node),
            "error",
            "heading-skip",
            `H${previousLevel} followed by H${heading.depth}`,
          );
        if (/^(frequently asked questions|faqs?)$/i.test(text))
          add(
            lineOf(node),
            "error",
            "faq-in-body",
            "FAQs belong in frontmatter `faqs`, which also feeds JSON-LD",
          );
        if (/\p{Extended_Pictographic}/u.test(text))
          add(lineOf(node), "error", "no-emoji", "emoji in heading");
        previousLevel = heading.depth;
        if (heading.depth === 2) seenH2 = true;
        return;
      }
      case "containerDirective":
        if (!KNOWN_DIRECTIVES.has(node.name))
          add(lineOf(node), "error", "unknown-directive", `:::${node.name}`);
        if (node.name === "msp-cta") {
          mspLinks++;
          if (!seenH2)
            add(
              lineOf(node),
              "error",
              "msp-in-answer",
              "no Milne Se Pehle CTA before the first ## (answer first, neutrally)",
            );
        }
        return;
      case "link":
        if (isMspUrl(node.url)) {
          mspLinks++;
          if (!seenH2)
            add(
              lineOf(node),
              "error",
              "msp-in-answer",
              "no Milne Se Pehle link before the first ## (answer first, neutrally)",
            );
        } else if (/^\/[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(node.url))
          internalLinks.push(node.url);
        return;
      case "image":
        if (!node.alt?.trim())
          add(lineOf(node), "error", "image-alt", "image needs alt text");
        return;
      case "paragraph": {
        const text = flatten((node as Paragraph).children);
        if (/\p{Extended_Pictographic}/u.test(text))
          add(lineOf(node), "error", "no-emoji", "emoji in body text");
        const paragraphSentences = splitSentences(text);
        if (paragraphSentences.length > MAX_SENTENCES_PER_PARAGRAPH)
          add(
            lineOf(node),
            "error",
            "paragraph-length",
            `${paragraphSentences.length} sentences (max ${MAX_SENTENCES_PER_PARAGRAPH})`,
          );
        const inExperience = hasAncestorDirective(ancestors, "experience");
        for (const sentence of paragraphSentences) {
          if (
            /\d/.test(sentence.replaceAll(CITE, "")) &&
            !sentence.includes(CITE) &&
            !inExperience
          ) {
            add(
              lineOf(node),
              "error",
              "unsourced-number",
              `cite a source in this sentence: "${sentence.replaceAll(CITE, "").slice(0, 80)}"`,
            );
          }
          sentences.push({ text: sentence, line: lineOf(node) });
        }
        return;
      }
    }
  });

  if (mspLinks > MAX_MSP_LINKS)
    add(
      1,
      "error",
      "msp-links",
      `${mspLinks} links/CTAs to milnesepehle.in (max ${MAX_MSP_LINKS})`,
    );

  // 4. Style warnings (do not fail the build, but fix them before review).
  for (let i = 0; i + 4 <= sentences.length; i++) {
    const run = sentences.slice(i, i + 4).map((s) => words(s.text).length);
    if (Math.max(...run) - Math.min(...run) <= 4) {
      add(
        sentences[i]?.line ?? 1,
        "warning",
        "sentence-rhythm",
        "4 sentences in a row of similar length; vary them",
      );
      i += 3;
    }
  }
  const flesch = fleschReadingEase(sentences.map((s) => s.text));
  if (flesch < MIN_FLESCH)
    add(
      1,
      "warning",
      "readability",
      `Flesch reading ease ${flesch.toFixed(0)} (target 55 to 70)`,
    );

  if (article) {
    const pillar = `/${article.category.slug}`;
    if (!article.frontmatter.pillar && !internalLinks.includes(pillar))
      add(1, "warning", "pillar-link", `link the pillar page ${pillar}`);
    const siblings = new Set(
      internalLinks.filter((l) => l.split("/").length === 3),
    );
    if (siblings.size < 2)
      add(
        1,
        "warning",
        "sibling-links",
        `${siblings.size} links to other articles (want at least 2)`,
      );
  }

  return issues.sort((a, b) => a.line - b.line);
}

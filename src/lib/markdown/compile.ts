import { compile } from "@mdx-js/mdx";
import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { remarkDirectives } from "./directives";
import { rehypeImg } from "./rehype-img";
import { rehypeLinks } from "./rehype-links";
import { rehypeToc, type TocEntry } from "./rehype-toc";

/** The H1 is rendered from frontmatter `title`; drop a leading `# Title` in the body. */
function remarkStripLeadingH1() {
  return (tree: Root) => {
    const first = tree.children[0];
    if (first?.type === "heading" && first.depth === 1) tree.children.shift();
  };
}

export type CompiledArticle = {
  /** MDX compiled to a function body; render with `run()` (see ArticleContent). */
  code: string;
  toc: TocEntry[];
  wordCount: number;
  readingMinutes: number;
};

const WORDS_PER_MINUTE = 200;

// No sanitizer: MDX is code (it can contain JSX and expressions), so articles
// are trusted input, reviewed in git like any other source file.
export async function compileArticle(
  body: string,
  { slug }: { slug: string },
): Promise<CompiledArticle> {
  const toc: TocEntry[] = [];
  const compiled = await compile(body, {
    outputFormat: "function-body",
    remarkPlugins: [
      remarkGfm,
      remarkDirective,
      remarkDirectives,
      remarkStripLeadingH1,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeToc, { into: toc }],
      [rehypeLinks, { slug }],
      rehypeImg,
    ],
  });

  // Count words on the source (not the injected CTA copy).
  const mdast = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(body);
  const wordCount = toString(mdast).split(/\s+/).filter(Boolean).length;

  return {
    code: String(compiled),
    toc,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
  };
}

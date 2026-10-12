import path from "node:path";
import matter from "gray-matter";
import { findAuthor, type Author } from "./authors";
import { findCategory, type Category } from "./categories";
import { frontmatterSchema, type Frontmatter } from "./schema";

/**
 * A hero image is three files side by side, named after `heroImage.src`:
 * <name>.webp (1200w, the page banner), <name>-800.webp (phones) and
 * <name>.jpg (share image: LinkedIn and some apps reject WebP previews).
 */
export function heroFiles(src: string) {
  const base = src.replace(/\.webp$/, "");
  return { src, small: `${base}-800.webp`, share: `${base}.jpg` };
}

export type ParsedArticle = {
  frontmatter: Frontmatter;
  /** MDX body without frontmatter. */
  body: string;
  category: Category;
  author: Author;
  reviewer?: Author;
};

/**
 * Parses and validates one .mdx file. Pure (no fs, no Next), so content:lint
 * and the build share exactly the same rules. Returns problems instead of
 * throwing so the linter can report them all.
 */
export function checkArticle(
  raw: string,
  filePath: string,
): { article?: ParsedArticle; problems: string[] } {
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (error) {
    return {
      problems: [
        `frontmatter YAML does not parse: ${(error as Error).message}`,
      ],
    };
  }

  const result = frontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    return {
      problems: result.error.issues.map(
        (i) => `${i.path.join(".") || "frontmatter"}: ${i.message}`,
      ),
    };
  }
  const fm = result.data;
  const problems: string[] = [];

  const expectedFile = `${fm.slug}.mdx`;
  if (path.basename(filePath) !== expectedFile)
    problems.push(`file must be named ${expectedFile} (matches slug)`);

  const category = findCategory(fm.category);
  if (!category)
    problems.push(
      `category "${fm.category}" is not in src/content/categories.ts`,
    );
  const author = findAuthor(fm.author);
  if (!author)
    problems.push(`author "${fm.author}" is not in src/content/authors.ts`);
  const reviewer = fm.reviewer ? findAuthor(fm.reviewer) : undefined;
  if (fm.reviewer && !reviewer)
    problems.push(`reviewer "${fm.reviewer}" is not in src/content/authors.ts`);

  if (problems.length > 0 || !category || !author) return { problems };
  return {
    article: {
      frontmatter: fm,
      body: parsed.content,
      category,
      author,
      reviewer,
    },
    problems,
  };
}

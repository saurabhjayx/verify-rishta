// Usage: pnpm content:lint [file|dir ...]   (default: content/), lints .mdx articles
// Exits 1 if any file has errors. Warnings are printed but do not fail.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { checkArticle, heroFiles } from "@/content/article";
import { lintMarkdown } from "@/lib/content-lint/lint";
import { markdownFiles } from "./markdown-files";

const targets = process.argv.slice(2);
const files = await markdownFiles(targets.length > 0 ? targets : ["content"]);
let errors = 0;
let warnings = 0;

// Hero files live in public/, which serverless runtimes do not ship, so this
// check runs here (CI) instead of in the content loader.
const missingHeroFiles = (raw: string, file: string) => {
  const hero = checkArticle(raw, file).article?.frontmatter.heroImage;
  if (!hero) return [];
  return Object.values(heroFiles(hero.src))
    .filter((src) => !existsSync(path.join("public", src)))
    .map((src) => ({
      line: 1,
      severity: "error" as const,
      rule: "hero-image",
      message: `missing public${src}`,
    }));
};

for (const file of files) {
  const raw = await readFile(file, "utf8");
  for (const issue of [
    ...lintMarkdown(raw, file),
    ...missingHeroFiles(raw, file),
  ]) {
    if (issue.severity === "error") errors++;
    else warnings++;
    console.log(
      `${file}:${issue.line}  ${issue.severity.padEnd(7)}  ${issue.rule.padEnd(17)}  ${issue.message}`,
    );
  }
}

console.log(
  `\n${files.length} file(s), ${errors} error(s), ${warnings} warning(s)`,
);
process.exit(errors > 0 ? 1 : 0);

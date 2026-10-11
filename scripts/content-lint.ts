// Usage: pnpm content:lint [file|dir ...]   (default: content/), lints .mdx articles
// Exits 1 if any file has errors. Warnings are printed but do not fail.
import { readFile } from "node:fs/promises";
import { lintMarkdown } from "@/lib/content-lint/lint";
import { markdownFiles } from "./markdown-files";

const targets = process.argv.slice(2);
const files = await markdownFiles(targets.length > 0 ? targets : ["content"]);
let errors = 0;
let warnings = 0;

for (const file of files) {
  for (const issue of lintMarkdown(await readFile(file, "utf8"), file)) {
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

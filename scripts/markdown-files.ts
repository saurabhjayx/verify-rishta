import { readdir, stat } from "node:fs/promises";
import path from "node:path";

/** Expands file and directory arguments to a sorted list of .mdx files. */
export async function markdownFiles(targets: string[]): Promise<string[]> {
  const lists = await Promise.all(
    targets.map(async (target) => {
      if (!(await stat(target)).isDirectory())
        return target.endsWith(".mdx") ? [target] : [];
      const entries = await readdir(target, { recursive: true });
      return entries
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => path.join(target, f));
    }),
  );
  return lists.flat().sort();
}

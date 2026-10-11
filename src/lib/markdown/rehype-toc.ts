import type { Root } from "hast";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

/** Collects H2/H3 (after rehype-slug assigned ids) into `into`. */
export function rehypeToc({ into }: { into: TocEntry[] }) {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const { id, className } = node.properties;
      // GFM's visually hidden "Footnotes" heading is not a section.
      if (Array.isArray(className) && className.includes("sr-only")) return;
      if (typeof id !== "string") return;
      into.push({
        id,
        text: toString(node).trim(),
        level: node.tagName === "h2" ? 2 : 3,
      });
    });
  };
}

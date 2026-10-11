import type { Root } from "hast";
import { visit } from "unist-util-visit";

// ponytail: lazy-load only, no width/height. Body images will cause CLS; read
// dimensions from public/images at upsert time when the first article ships one.
// The hero image (LCP) is rendered by next/image from frontmatter, not here.
export function rehypeImg() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      node.properties.loading = "lazy";
      node.properties.decoding = "async";
    });
  };
}

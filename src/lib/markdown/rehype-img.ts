import { readFileSync } from "node:fs";
import path from "node:path";
import type { Root } from "hast";
import { visit } from "unist-util-visit";

/** Width and height from a WebP header (VP8, VP8L or VP8X chunk), or undefined. */
export function webpSize(
  buf: Buffer,
): { width: number; height: number } | undefined {
  if (
    buf.length < 30 ||
    buf.toString("ascii", 0, 4) !== "RIFF" ||
    buf.toString("ascii", 8, 12) !== "WEBP"
  )
    return undefined;
  switch (buf.toString("ascii", 12, 16)) {
    case "VP8 ":
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    case "VP8L": {
      const bits = buf.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    case "VP8X":
      return {
        width: buf.readUIntLE(24, 3) + 1,
        height: buf.readUIntLE(27, 3) + 1,
      };
    default:
      return undefined;
  }
}

/** Size of a local /public WebP, read at build. Undefined if not readable here. */
function localWebpSize(src: string) {
  if (!src.startsWith("/") || !src.endsWith(".webp")) return undefined;
  try {
    return webpSize(readFileSync(path.join("public", src)));
  } catch {
    return undefined; // e.g. a serverless runtime without public/: render without size
  }
}

// Body images: lazy, async decode, and width/height from the file so the
// browser reserves space (no CLS). The hero (LCP) is rendered from frontmatter
// by ArticleHeader, not here.
export function rehypeImg() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      node.properties.loading = "lazy";
      node.properties.decoding = "async";
      const src = node.properties.src;
      const size = typeof src === "string" ? localWebpSize(src) : undefined;
      if (size) {
        node.properties.width = size.width;
        node.properties.height = size.height;
      }
    });
  };
}

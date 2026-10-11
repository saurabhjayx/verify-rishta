import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { isMspUrl, withMspUtm } from "@/lib/seo/utm";

/**
 * External links get rel="noopener". Links to milnesepehle.in get UTMs:
 * utm_content is the :::msp-cta placement ("mid", "end") or "inline" for body links.
 */
export function rehypeLinks({ slug }: { slug: string }) {
  return (tree: Root) => {
    const placementOf = new Map<Element, string>();
    visit(tree, "element", (node) => {
      const placement =
        node.tagName === "aside" ? node.properties.dataPlacement : undefined;
      if (typeof placement !== "string") return;
      visit(node, "element", (child) => {
        if (child.tagName === "a") placementOf.set(child, placement);
      });
    });

    visit(tree, "element", (node) => {
      const href = node.properties.href;
      if (
        node.tagName !== "a" ||
        typeof href !== "string" ||
        !/^https?:\/\//.test(href)
      )
        return;
      node.properties.rel = ["noopener"];
      if (isMspUrl(href)) {
        node.properties.href = withMspUtm(
          href,
          slug,
          placementOf.get(node) ?? "inline",
        );
      }
    });
  };
}

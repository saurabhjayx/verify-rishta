import type { Paragraph, Root, RootContent } from "mdast";
import type {} from "remark-directive"; // registers directive node types on mdast
import { SKIP, visit } from "unist-util-visit";
import { MSP_URL } from "@/lib/seo/utm";

type ContainerDirective = Extract<RootContent, { type: "containerDirective" }>;

const CALLOUT_TYPES = new Set(["warning", "info"]);
const CTA_PLACEMENTS = new Set(["mid", "end"]);

const label = (text: string): Paragraph => ({
  type: "paragraph",
  data: { hProperties: { className: ["directive-label"] } },
  children: [{ type: "text", value: text }],
});

function fail(node: ContainerDirective, message: string): never {
  const line = node.position?.start.line ?? "?";
  throw new Error(`Line ${line}: ${message}`);
}

function transform(node: ContainerDirective): void {
  const aside = (className: string[], extra: Record<string, string> = {}) => {
    node.data = { hName: "aside", hProperties: { className, ...extra } };
  };

  switch (node.name) {
    case "callout": {
      const type = node.attributes?.type ?? "info";
      if (!CALLOUT_TYPES.has(type))
        fail(
          node,
          `:::callout type must be one of ${[...CALLOUT_TYPES].join(", ")}`,
        );
      aside(["callout", `callout-${type}`]);
      return;
    }
    case "experience":
      aside(["experience"]);
      node.children.unshift(label("What we see at Milne Se Pehle"));
      return;
    case "composite":
      aside(["composite"]);
      node.children.unshift(label("Composite example"));
      return;
    case "msp-cta": {
      const placement = node.attributes?.placement ?? "";
      if (!CTA_PLACEMENTS.has(placement))
        fail(node, `:::msp-cta needs placement="mid" or placement="end"`);
      aside(["msp-cta"], { dataPlacement: placement });
      // Neutral by design: names the other options first, discloses ownership
      // inline, and makes no product claims. Do not turn this into ad copy.
      node.children = [
        label("If you want help with this"),
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value:
                "You can do these checks yourselves, ask a lawyer, or use a consent-based verification service. Milne Se Pehle is one such service. It is run by the team that publishes VerifyRishta, so weigh it like any other option.",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              url: MSP_URL,
              children: [
                { type: "text", value: "See how Milne Se Pehle works" },
              ],
            },
          ],
        },
      ];
      return;
    }
    default:
      fail(node, `unknown directive :::${node.name}`);
  }
}

/**
 * Turns our container directives into <aside> blocks. Text and leaf directives
 * are not ours: "Note:this" parses as a text directive, so restore it as text.
 */
export function remarkDirectives() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (node.type === "containerDirective") {
        transform(node);
        return;
      }
      if (
        (node.type === "textDirective" || node.type === "leafDirective") &&
        parent &&
        index !== undefined
      ) {
        const text = {
          type: "text" as const,
          value: `:${node.type === "leafDirective" ? ":" : ""}${node.name}`,
        };
        const restored =
          node.type === "leafDirective"
            ? [
                {
                  type: "paragraph" as const,
                  children: [text, ...node.children],
                },
              ]
            : [text, ...node.children];
        parent.children.splice(
          index,
          1,
          ...(restored as typeof parent.children),
        );
        return [SKIP, index + restored.length];
      }
    });
  };
}

import type { Root } from "hast";
import { toString as hastToString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

export function rehypeHeadingId() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "h2" || node.tagName === "h3") {
        const text = hastToString(node).trim();
        const id = text
          .toLowerCase()
          .replaceAll(/[^a-z0-9\s-]/g, "")
          .replaceAll(/\s+/g, "-");

        node.properties.id = id;
      }
    });
  };
}

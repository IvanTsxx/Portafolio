// src/shared/utils/shiki/rehype-code-language.ts
import type { Root, Element } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Copies the language from <code class="language-tsx"> to <pre data-language="tsx">
 * Must run BEFORE rehype-shiki
 */
const rehypeCodeLanguage: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "pre") return;

    const code = node.children.find(
      (child): child is Element =>
        child.type === "element" && child.tagName === "code"
    );

    if (!code) return;

    const className = code.properties?.className;
    // className is string[] in hast, not string
    const classArray = Array.isArray(className) ? className.map(String) : [];
    const langClass = classArray.find((c) => c.startsWith("language-"));
    if (!langClass) return;

    const language = langClass.replace("language-", "");
    node.properties["data-language"] = language;
  });
};
export { rehypeCodeLanguage };

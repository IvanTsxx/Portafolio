import type { RegistryCssNode, RegistryCssVars } from "./schema";

const indentUnit = "  ";

const serializeNode = (
  key: string,
  node: RegistryCssNode,
  depth: number
): string => {
  const indent = indentUnit.repeat(depth);
  if (node.kind === "declaration") {
    return `${indent}${key}: ${node.value};`;
  }
  const body = Object.entries(node.rules)
    .map(([childKey, child]) => serializeNode(childKey, child, depth + 1))
    .join("\n");
  return `${indent}${key} {\n${body}\n${indent}}`;
};

export const serializeRegistryCss = (
  css: Readonly<Record<string, RegistryCssNode>>
) =>
  Object.entries(css)
    .map(([key, node]) => serializeNode(key, node, 0))
    .join("\n\n");

const serializeVariables = (
  selector: string,
  variables: Readonly<Record<string, string>> | undefined
) => {
  if (!variables || Object.keys(variables).length === 0) {
    return null;
  }
  const rules = Object.fromEntries(
    Object.entries(variables).map(([name, value]) => [
      `--${name}`,
      { kind: "declaration", value } satisfies RegistryCssNode,
    ])
  );
  return serializeNode(selector, { kind: "block", rules }, 0);
};

export const serializeRegistryCssVars = (cssVars: RegistryCssVars) =>
  [
    serializeVariables("@theme inline", cssVars.theme),
    serializeVariables(":root", cssVars.light),
    serializeVariables(".dark", cssVars.dark),
  ]
    .filter((block): block is string => block !== null)
    .join("\n\n");

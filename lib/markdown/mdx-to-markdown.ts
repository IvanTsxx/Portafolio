import type {
  BlockContent,
  DefinitionContent,
  PhrasingContent,
  RootContent,
} from "mdast";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { z } from "zod";

import {
  bulletList,
  emphasis,
  link,
  list,
  paragraph,
  strong,
  text,
} from "./mdast";

type JsxElement = Extract<
  RootContent,
  { type: "mdxJsxFlowElement" | "mdxJsxTextElement" }
>;

type FlowContent = BlockContent | DefinitionContent;

export interface MdxScope {
  meta?: Readonly<Partial<Record<string, readonly string[]>>>;
}

type Convert = (nodes: readonly RootContent[]) => RootContent[];

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);

const droppedTypes = new Set<RootContent["type"]>([
  "mdxFlowExpression",
  "mdxTextExpression",
  "mdxjsEsm",
]);

const phrasingTypes = new Set<RootContent["type"]>([
  "break",
  "delete",
  "emphasis",
  "footnoteReference",
  "html",
  "image",
  "imageReference",
  "inlineCode",
  "link",
  "linkReference",
  "strong",
  "text",
]);

const flowTypes = new Set<RootContent["type"]>([
  "blockquote",
  "code",
  "definition",
  "footnoteDefinition",
  "heading",
  "list",
  "paragraph",
  "table",
  "thematicBreak",
]);

const droppedElements = new Set(["iframe", "img", "svg", "video"]);

const metaPrefix = "meta.";

const metaReferencePattern = /^meta\.[A-Za-z]\w*$/u;

const stringValueSchema = z.string();

const expressionValueSchema = z.object({ value: z.string() });

const isPhrasing = (node: RootContent): node is PhrasingContent =>
  phrasingTypes.has(node.type);

const isFlow = (node: RootContent): node is FlowContent =>
  flowTypes.has(node.type);

const isJsxElement = (node: RootContent): node is JsxElement =>
  node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";

const isBlank = (node: RootContent) =>
  node.type === "text" && node.value.trim() === "";

const attributeValue = (element: JsxElement, name: string) =>
  element.attributes.find(
    (entry) => entry.type === "mdxJsxAttribute" && entry.name === name
  )?.value;

const stringAttribute = (element: JsxElement, name: string) =>
  stringValueSchema.safeParse(attributeValue(element, name)).data;

const expressionAttribute = (element: JsxElement, name: string) =>
  expressionValueSchema.safeParse(attributeValue(element, name)).data?.value;

const sentence = (value: string) => value.trim().replace(/[.\s]*$/u, ".");

const toFlow = (nodes: readonly RootContent[]): FlowContent[] => {
  const flow: FlowContent[] = [];
  let phrasing: PhrasingContent[] = [];
  const flush = () => {
    if (phrasing.some((node) => !isBlank(node))) {
      flow.push(paragraph(...phrasing));
    }
    phrasing = [];
  };
  for (const node of nodes) {
    if (isPhrasing(node)) {
      phrasing.push(node);
    } else {
      flush();
      if (isFlow(node)) {
        flow.push(node);
      }
    }
  }
  flush();
  return flow;
};

const toBlocks = (nodes: readonly RootContent[]): BlockContent[] =>
  toFlow(nodes).filter(
    (node): node is BlockContent => node.type !== "definition"
  );

const figureLine = (
  kind: string,
  description: string | undefined,
  caption: string | undefined,
  url?: string
) => [
  paragraph(
    emphasis(`${kind}: ${sentence(description ?? kind)}`),
    ...(caption ? [text(` ${sentence(caption)}`)] : []),
    ...(url ? [text(" "), link(url)] : [])
  ),
];

const stepElementsOf = (nodes: readonly RootContent[]) =>
  nodes.flatMap((node) =>
    (node.type === "paragraph" ? node.children : [node]).filter(
      (child): child is JsxElement =>
        isJsxElement(child) && child.name === "Step"
    )
  );

const resolveItems = (element: JsxElement, scope: MdxScope) => {
  const reference = expressionAttribute(element, "items") ?? "";
  return metaReferencePattern.test(reference)
    ? (scope.meta?.[reference.slice(metaPrefix.length)] ?? [])
    : [];
};

const convertElement = (
  element: JsxElement,
  scope: MdxScope,
  convert: Convert
): RootContent[] => {
  switch (element.name) {
    case "Callout": {
      return [
        {
          children: [
            paragraph(strong(stringAttribute(element, "title") ?? "Note")),
            ...toFlow(convert(element.children)),
          ],
          type: "blockquote",
        },
      ];
    }
    case "Steps": {
      return [
        list(
          stepElementsOf(element.children).map((step) => [
            paragraph(strong(stringAttribute(step, "title") ?? "Step")),
            ...toBlocks(convert(step.children)),
          ]),
          true
        ),
      ];
    }
    case "NoteList": {
      const items = resolveItems(element, scope);
      return items.length > 0 ? [bulletList(items)] : [];
    }
    case "Figure": {
      return figureLine(
        "Figure",
        stringAttribute(element, "alt"),
        stringAttribute(element, "caption")
      );
    }
    case "Diagram": {
      return figureLine(
        "Diagram",
        stringAttribute(element, "label"),
        stringAttribute(element, "caption")
      );
    }
    case "Video": {
      return figureLine(
        "Video",
        stringAttribute(element, "alt"),
        stringAttribute(element, "caption"),
        stringAttribute(element, "src")
      );
    }
    case "Demo": {
      return figureLine(
        "Demo",
        stringAttribute(element, "title"),
        stringAttribute(element, "caption"),
        stringAttribute(element, "src")
      );
    }
    default: {
      return element.name && droppedElements.has(element.name)
        ? []
        : convert(element.children);
    }
  }
};

const convertNodes = (
  nodes: readonly RootContent[],
  scope: MdxScope
): RootContent[] => {
  const convert: Convert = (children) => convertNodes(children, scope);
  return nodes.flatMap((node): RootContent[] => {
    if (droppedTypes.has(node.type)) {
      return [];
    }
    if (isJsxElement(node)) {
      return convertElement(node, scope, convert);
    }
    if (node.type === "paragraph") {
      return toFlow(convert(node.children));
    }
    if ("children" in node) {
      return [Object.assign(node, { children: convert(node.children) })];
    }
    return [node];
  });
};

export const mdxToMarkdownNodes = (source: string, scope: MdxScope = {}) =>
  convertNodes(parser.parse(source).children, scope);

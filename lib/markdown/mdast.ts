import type {
  BlockContent,
  Code,
  Heading,
  List,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  Table,
} from "mdast";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

export const text = (value: string): PhrasingContent => ({
  type: "text",
  value,
});

export const inlineCode = (value: string): PhrasingContent => ({
  type: "inlineCode",
  value,
});

export const strong = (value: string): PhrasingContent => ({
  children: [text(value)],
  type: "strong",
});

export const emphasis = (value: string): PhrasingContent => ({
  children: [text(value)],
  type: "emphasis",
});

export const link = (url: string, label = url): PhrasingContent => ({
  children: [text(label)],
  type: "link",
  url,
});

export const paragraph = (...children: PhrasingContent[]): Paragraph => ({
  children,
  type: "paragraph",
});

export const textParagraph = (value: string) => paragraph(text(value));

export const heading = (depth: 1 | 2 | 3, value: string): Heading => ({
  children: [text(value)],
  depth,
  type: "heading",
});

export const code = (value: string, lang?: string): Code => ({
  lang,
  type: "code",
  value,
});

export const list = (
  items: readonly BlockContent[][],
  ordered = false
): List => ({
  children: items.map((blocks) => ({
    children: blocks,
    spread: false,
    type: "listItem",
  })),
  ordered,
  spread: false,
  type: "list",
});

export const bulletList = (items: readonly string[]) =>
  list(items.map((item) => [textParagraph(item)]));

export const orderedList = (items: readonly string[]) =>
  list(
    items.map((item) => [textParagraph(item)]),
    true
  );

export const table = (
  head: readonly string[],
  rows: readonly (readonly PhrasingContent[])[]
): Table => ({
  children: [head.map(text), ...rows].map((cells) => ({
    children: cells.map((cell) => ({ children: [cell], type: "tableCell" })),
    type: "tableRow",
  })),
  type: "table",
});

const processor = unified().use(remarkGfm).use(remarkStringify, {
  bullet: "-",
  emphasis: "_",
  fences: true,
  rule: "-",
});

export const stringifyMarkdown = (children: readonly RootContent[]) => {
  const root: Root = { children: [...children], type: "root" };
  return processor.stringify(root);
};

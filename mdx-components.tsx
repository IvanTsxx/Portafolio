import type { MDXComponents } from "mdx/types";

import { Callout } from "@/components/content/callout";
import { Demo } from "@/components/content/demo";
import { Diagram } from "@/components/content/diagram";
import { Figure } from "@/components/content/figure";
import { NoteList } from "@/components/content/note-list";
import {
  ProseAnchor,
  ProseBlockquote,
  ProseCode,
  ProseEmphasis,
  ProseFigcaption,
  ProseFigure,
  ProseH2,
  ProseH3,
  ProseH4,
  ProseListItem,
  ProseOrderedList,
  ProseParagraph,
  ProsePre,
  ProseRule,
  ProseStrong,
  ProseTable,
  ProseTableCell,
  ProseTableHeading,
  ProseUnorderedList,
} from "@/components/content/prose";
import { Step, Steps } from "@/components/content/steps";
import { Video } from "@/components/content/video";

const components = {
  Callout,
  Demo,
  Diagram,
  Figure,
  NoteList,
  Step,
  Steps,
  Table: ProseTable,
  Video,
  a: ProseAnchor,
  blockquote: ProseBlockquote,
  code: ProseCode,
  em: ProseEmphasis,
  figcaption: ProseFigcaption,
  figure: ProseFigure,
  h2: ProseH2,
  h3: ProseH3,
  h4: ProseH4,
  hr: ProseRule,
  li: ProseListItem,
  ol: ProseOrderedList,
  p: ProseParagraph,
  pre: ProsePre,
  strong: ProseStrong,
  table: ProseTable,
  td: ProseTableCell,
  th: ProseTableHeading,
  ul: ProseUnorderedList,
} satisfies MDXComponents;

export const useMDXComponents = (): MDXComponents => components;

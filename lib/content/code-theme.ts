import type { ThemeRegistration } from "shiki";

const palette = {
  comment: "#7d7a76",
  constant: "#cfbb9a",
  foreground: "#f2f0ec",
  keyword: "#83a3bb",
  property: "#b0aeaa",
  punctuation: "#8a8783",
  rust: "#c76749",
  string: "#7bb587",
  variable: "#d9d6d0",
} as const;

export const codeTheme: ThemeRegistration = {
  colors: {
    "editor.background": "#00000000",
    "editor.foreground": palette.foreground,
  },
  name: "workshop-dark",
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { fontStyle: "italic", foreground: palette.comment },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
      ],
      settings: { foreground: palette.keyword },
    },
    {
      scope: ["keyword.operator", "keyword.operator.assignment"],
      settings: { foreground: palette.property },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "punctuation.definition.string",
      ],
      settings: { foreground: palette.string },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character.escape",
        "support.constant",
      ],
      settings: { foreground: palette.constant },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
      ],
      settings: { foreground: palette.foreground },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.other.inherited-class",
      ],
      settings: { foreground: palette.keyword },
    },
    {
      scope: ["variable", "variable.other.readwrite", "variable.parameter"],
      settings: { foreground: palette.variable },
    },
    {
      scope: [
        "variable.other.property",
        "variable.other.object.property",
        "meta.object-literal.key",
        "support.type.property-name",
      ],
      settings: { foreground: palette.property },
    },
    {
      scope: ["entity.name.tag", "support.class.component"],
      settings: { foreground: palette.keyword },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: palette.constant },
    },
    {
      scope: [
        "punctuation",
        "meta.brace",
        "meta.delimiter",
        "punctuation.definition.tag",
      ],
      settings: { foreground: palette.punctuation },
    },
    {
      scope: ["markup.heading", "markup.bold", "entity.name.section"],
      settings: { fontStyle: "bold", foreground: palette.foreground },
    },
    {
      scope: ["markup.italic"],
      settings: { fontStyle: "italic", foreground: palette.variable },
    },
    {
      scope: ["markup.inline.raw", "markup.fenced_code"],
      settings: { foreground: palette.constant },
    },
    {
      scope: ["markup.inserted", "meta.diff.header.to-file"],
      settings: { foreground: palette.string },
    },
    {
      scope: ["markup.deleted", "meta.diff.header.from-file", "invalid"],
      settings: { foreground: palette.rust },
    },
  ],
  type: "dark",
};

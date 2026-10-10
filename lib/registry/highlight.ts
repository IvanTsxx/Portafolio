import { codeToTokens } from "shiki";

import { codeTheme } from "@/lib/content/code-theme";

export type CodeLanguage = "css" | "json" | "ts" | "tsx";

export interface HighlightedToken {
  bold: boolean;
  color: string | null;
  content: string;
  italic: boolean;
  underline: boolean;
}

export type HighlightedLine = readonly HighlightedToken[];

const italicFlag = 1;
const boldFlag = 2;
const underlineFlag = 4;

const hasFontStyle = (fontStyle: number, flag: number) =>
  Math.floor(fontStyle / flag) % 2 === 1;

export const highlightCode = async (
  code: string,
  language: CodeLanguage
): Promise<HighlightedLine[]> => {
  const { tokens } = await codeToTokens(code.trimEnd(), {
    lang: language,
    theme: codeTheme,
  });
  return tokens.map((line) =>
    line.map((token) => ({
      bold: hasFontStyle(token.fontStyle ?? 0, boldFlag),
      color: token.color ?? null,
      content: token.content,
      italic: hasFontStyle(token.fontStyle ?? 0, italicFlag),
      underline: hasFontStyle(token.fontStyle ?? 0, underlineFlag),
    }))
  );
};

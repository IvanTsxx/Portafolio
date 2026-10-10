import type { InkPattern } from "./ink";
import { hashText } from "./seeded";

export interface LanguageMark {
  code: string;
  jp: string | null;
  pattern: InkPattern;
}

const knownLanguages = new Map<string, LanguageMark>([
  ["CSS", { code: "CSS", jp: "スタイル", pattern: "horizontal" }],
  ["Go", { code: "GO", jp: "ゴー", pattern: "grid" }],
  ["HTML", { code: "HTML", jp: "マークアップ", pattern: "vertical" }],
  [
    "JavaScript",
    { code: "JS", jp: "ジャバスクリプト", pattern: "reverse-diagonal" },
  ],
  ["Python", { code: "PY", jp: "パイソン", pattern: "dots" }],
  ["Rust", { code: "RS", jp: "ラスト", pattern: "crosshatch" }],
  ["Shell", { code: "SH", jp: "シェル", pattern: "tone" }],
  ["TypeScript", { code: "TS", jp: "タイプスクリプト", pattern: "diagonal" }],
]);

const unknownLanguage: LanguageMark = {
  code: "—",
  jp: "不明",
  pattern: "hollow",
};

const fallbackPatterns = [
  "solid",
  "tone",
  "crosshatch",
  "grid",
  "vertical",
  "horizontal",
  "reverse-diagonal",
  "dots",
] as const satisfies readonly InkPattern[];

export const languageMark = (language: string | null): LanguageMark => {
  if (language === null) {
    return unknownLanguage;
  }
  return (
    knownLanguages.get(language) ?? {
      code:
        language
          .replaceAll(/[^A-Za-z0-9+#]/gu, "")
          .slice(0, 3)
          .toUpperCase() || "—",
      jp: null,
      pattern:
        fallbackPatterns[hashText(language) % fallbackPatterns.length] ??
        "solid",
    }
  );
};

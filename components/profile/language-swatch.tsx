import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { inkPatterns } from "./ink";
import { languageMark } from "./languages";

interface LanguageSwatchProps {
  language: string | null;
  className?: string;
  style?: CSSProperties;
}

export const LanguageSwatch = ({
  language,
  className,
  style,
}: LanguageSwatchProps) => (
  <span
    aria-hidden
    className={cn("border-ink block border", className)}
    style={{ ...inkPatterns[languageMark(language).pattern], ...style }}
  />
);

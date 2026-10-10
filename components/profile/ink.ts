import type { CSSProperties } from "react";

export const profileLink =
  "decoration-graphite/40 ease-mechanical hover:decoration-ink underline decoration-dotted underline-offset-4 transition-[text-decoration-color] duration-100 hover:decoration-solid";

const ink = "var(--ink)";

export const inkPatterns = {
  crosshatch: {
    backgroundImage: `repeating-linear-gradient(45deg, ${ink} 0 1px, transparent 1px 4px), repeating-linear-gradient(135deg, ${ink} 0 1px, transparent 1px 4px)`,
  },
  diagonal: {
    backgroundImage: `repeating-linear-gradient(135deg, ${ink} 0 1.5px, transparent 1.5px 4px)`,
  },
  "diagonal-fine": {
    backgroundImage: `repeating-linear-gradient(135deg, ${ink} 0 1px, transparent 1px 3px)`,
  },
  dots: {
    backgroundImage: `radial-gradient(${ink} 1px, transparent 1.25px)`,
    backgroundSize: "4px 4px",
  },
  grid: {
    backgroundImage: `linear-gradient(${ink} 1px, transparent 1px), linear-gradient(90deg, ${ink} 1px, transparent 1px)`,
    backgroundSize: "4px 4px",
  },
  hollow: {},
  horizontal: {
    backgroundImage: `repeating-linear-gradient(0deg, ${ink} 0 1px, transparent 1px 3px)`,
  },
  "reverse-diagonal": {
    backgroundImage: `repeating-linear-gradient(45deg, ${ink} 0 1.5px, transparent 1.5px 4px)`,
  },
  solid: { backgroundColor: ink },
  tone: {
    backgroundColor: "color-mix(in oklch, var(--graphite) 40%, transparent)",
  },
  vertical: {
    backgroundImage: `repeating-linear-gradient(90deg, ${ink} 0 1px, transparent 1px 3px)`,
  },
} as const satisfies Record<string, CSSProperties>;

export type InkPattern = keyof typeof inkPatterns;

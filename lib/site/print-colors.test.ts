import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseGlobalsCss } from "@/lib/design-system/css-parse";
import { globalsCssPath } from "@/lib/design-system/load";

import { printColors } from "./print-colors";

const globals = parseGlobalsCss(
  await readFile(path.join(process.cwd(), globalsCssPath), "utf-8")
);

const darkTokens = {
  bone: "foreground",
  border: "border",
  borderStrong: "border-strong",
  charcoal: "background",
  faint: "faint",
  muted: "muted-foreground",
  signal: "signal",
} as const satisfies Record<keyof typeof printColors, string>;

const printedHex: Readonly<Record<string, string>> = printColors;

const darkHex = (token: string) =>
  (globals.dark.get(`--${token}`) ?? "").toLowerCase();

describe("print colors mirror the dark theme tokens", () => {
  test.each(Object.entries(darkTokens))(
    "%s matches --%s in .dark",
    (key, token) => {
      expect(printedHex[key]).toBe(darkHex(token));
    }
  );
});

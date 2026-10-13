import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { oklchToSrgb, parseOklch, toHex } from "@/lib/design-system/color";
import { parseGlobalsCss } from "@/lib/design-system/css-parse";
import { globalsCssPath } from "@/lib/design-system/load";

import { inkAlpha, printColors } from "./print-colors";

const globals = parseGlobalsCss(
  await readFile(path.join(process.cwd(), globalsCssPath), "utf-8")
);

const tokenHex = (token: string) => {
  const parsed = parseOklch(globals.root.get(`--${token}`) ?? "");
  if (!parsed) {
    throw new Error(`--${token} is not an oklch token`);
  }
  return toHex(oklchToSrgb(parsed));
};

describe("print colors mirror the globals.css tokens", () => {
  test.each(Object.entries(printColors))(
    "%s matches its :root token",
    (token, hex) => {
      expect(tokenHex(token)).toBe(hex);
    }
  );

  test("inkAlpha uses the ink channels", () => {
    const [red, green, blue] = oklchToSrgb(
      parseOklch(globals.root.get("--ink") ?? "") ?? {
        alpha: 1,
        chroma: 0,
        hue: 0,
        lightness: 0,
      }
    ).map((channel) => Math.round(channel * 255));
    expect(inkAlpha(0.7)).toBe(`rgba(${red}, ${green}, ${blue}, 0.7)`);
  });
});

import { describe, expect, test } from "bun:test";

import {
  dedent,
  findRules,
  parseCss,
  parseGlobalsCss,
  ruleToCss,
} from "./css-parse";

const fixture = `
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

/* palette */
@theme inline {
  --color-paper: var(--paper);
  --font-sans:
    var(--font-zen-kaku), "Hiragino Sans",
    sans-serif;
}

:root {
  --paper: oklch(0.94 0.003 106);
  --grain: url("data:image/svg+xml,%3Csvg width='160'; height='160'%3E");
}

@utility label {
  font-size: 0.625rem;
  text-transform: uppercase;
}

@layer base {
  html {
    @apply bg-background;
    scrollbar-color: var(--rule-strong) transparent;
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before {
      animation-duration: 0.01ms !important;
    }
  }
}
`;

describe("parseCss", () => {
  const rules = parseCss(fixture);

  test("reads top-level rules and skips at-statements", () => {
    expect(rules.map((rule) => rule.header)).toEqual([
      "@theme inline",
      ":root",
      "@utility label",
      "@layer base",
    ]);
  });

  test("keeps semicolons and colons that sit inside quotes", () => {
    const root = rules.find((rule) => rule.header === ":root");
    expect(root?.declarations.map((declaration) => declaration.name)).toEqual([
      "--paper",
      "--grain",
    ]);
    expect(root?.declarations[1]?.value).toContain("width='160'; height='160'");
  });

  test("collapses multi-line values onto one line", () => {
    const theme = rules.find((rule) => rule.header === "@theme inline");
    expect(theme?.declarations[1]?.value).toBe(
      'var(--font-zen-kaku), "Hiragino Sans", sans-serif'
    );
  });

  test("finds nested rules and drops at-apply statements", () => {
    const [reduced] = findRules(rules, (rule) =>
      rule.header.startsWith("@media (prefers-reduced-motion")
    );
    expect(reduced?.declarations).toEqual([]);
    expect(reduced?.rules[0]?.declarations[0]?.name).toBe("animation-duration");
    const [html] = findRules(rules, (rule) => rule.header === "html");
    expect(html?.declarations).toEqual([
      { name: "scrollbar-color", value: "var(--rule-strong) transparent" },
    ]);
  });

  test("throws on unbalanced braces", () => {
    expect(() => parseCss(":root { --a: 1;")).toThrow("Unbalanced braces");
  });
});

describe("parseGlobalsCss", () => {
  const globals = parseGlobalsCss(fixture);

  test("indexes root, theme and utilities", () => {
    expect(globals.root.get("--paper")).toBe("oklch(0.94 0.003 106)");
    expect(globals.theme.get("--color-paper")).toBe("var(--paper)");
    expect([...globals.utilities.keys()]).toEqual(["label"]);
  });
});

describe("ruleToCss", () => {
  test("round-trips a utility body", () => {
    const globals = parseGlobalsCss(fixture);
    const label = globals.utilities.get("label");
    expect(label ? ruleToCss(label) : "").toBe(
      "@utility label {\n  font-size: 0.625rem;\n  text-transform: uppercase;\n}"
    );
  });

  test("dedent trims blank edges and shared indentation", () => {
    expect(dedent("\n    a\n      b\n\n")).toBe("a\n  b");
  });
});

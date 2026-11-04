import { describe, expect, test } from "bun:test";

import { findRules, parseCss, parseGlobalsCss } from "./css-parse";

const fixture = `
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

/* palette */
@theme inline {
  --color-background: var(--background);
  --font-sans:
    var(--font-geist-sans), ui-sans-serif,
    sans-serif;
}

:root {
  --background: #f7f6f2;
  --grain: url("data:image/svg+xml,%3Csvg width='160'; height='160'%3E");
}

.dark {
  --background: #0b0b0c;
}

@utility label {
  font-size: 0.625rem;
  text-transform: uppercase;
}

@layer base {
  html {
    @apply bg-background;
    scrollbar-color: var(--border-strong) transparent;
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
      ".dark",
      "@utility label",
      "@layer base",
    ]);
  });

  test("keeps semicolons and colons that sit inside quotes", () => {
    const root = rules.find((rule) => rule.header === ":root");
    expect(root?.declarations.map((declaration) => declaration.name)).toEqual([
      "--background",
      "--grain",
    ]);
    expect(root?.declarations[1]?.value).toContain("width='160'; height='160'");
  });

  test("collapses multi-line values onto one line", () => {
    const theme = rules.find((rule) => rule.header === "@theme inline");
    expect(theme?.declarations[1]?.value).toBe(
      "var(--font-geist-sans), ui-sans-serif, sans-serif"
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
      { name: "scrollbar-color", value: "var(--border-strong) transparent" },
    ]);
  });

  test("throws on unbalanced braces", () => {
    expect(() => parseCss(":root { --a: 1;")).toThrow("Unbalanced braces");
  });
});

describe("parseGlobalsCss", () => {
  const globals = parseGlobalsCss(fixture);

  test("indexes root, dark, theme and utilities", () => {
    expect(globals.root.get("--background")).toBe("#f7f6f2");
    expect(globals.dark.get("--background")).toBe("#0b0b0c");
    expect(globals.theme.get("--color-background")).toBe("var(--background)");
    expect([...globals.utilities.keys()]).toEqual(["label"]);
  });
});

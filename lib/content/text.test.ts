import { describe, expect, test } from "bun:test";

import {
  countWords,
  extractHeadings,
  hasMetaExport,
  readingTimeMinutes,
  removeMetaExport,
  slugifyHeading,
} from "./text";

const words = (count: number) =>
  Array.from({ length: count }, () => "word").join(" ");

describe("slugifyHeading", () => {
  test("lowercases and hyphenates like rehype-slug", () => {
    expect(slugifyHeading("What is isolated and what is shared")).toBe(
      "what-is-isolated-and-what-is-shared"
    );
  });

  test("drops punctuation and keeps the doubled hyphen github-slugger produces", () => {
    expect(slugifyHeading("Motion & interaction")).toBe("motion--interaction");
    expect(slugifyHeading("Cut lanes along files, not features")).toBe(
      "cut-lanes-along-files-not-features"
    );
  });

  test("keeps letters and digits from other scripts", () => {
    expect(slugifyHeading("Año 2026")).toBe("año-2026");
  });
});

describe("extractHeadings", () => {
  test("returns h2 and h3 with depth, text and id", () => {
    const body = [
      "## Context",
      "text",
      "### Motion tokens",
      "#### Ignored",
    ].join("\n");
    expect(extractHeadings(body)).toEqual([
      { depth: 2, id: "context", text: "Context" },
      { depth: 3, id: "motion-tokens", text: "Motion tokens" },
    ]);
  });

  test("ignores heading-like lines inside fenced code", () => {
    const body = [
      "## Real",
      "```md",
      "## Not a heading",
      "```",
      "## After",
    ].join("\n");
    expect(extractHeadings(body).map((heading) => heading.text)).toEqual([
      "Real",
      "After",
    ]);
  });

  test("numbers duplicate ids the way rehype-slug does", () => {
    const body = ["## Notes", "## Notes", "## Notes"].join("\n");
    expect(extractHeadings(body).map((heading) => heading.id)).toEqual([
      "notes",
      "notes-1",
      "notes-2",
    ]);
  });

  test("drops emphasis underscores but keeps underscores inside words", () => {
    const body = ["## Using _emphasis_ here", "## The snake_case name"].join(
      "\n"
    );
    expect(extractHeadings(body).map((heading) => heading.id)).toEqual([
      "using-emphasis-here",
      "the-snake_case-name",
    ]);
  });

  test("strips inline markup from the text and the id", () => {
    const body =
      "## Using `bun x` with **bold** and [a link](https://example.com)";
    expect(extractHeadings(body)).toEqual([
      {
        depth: 2,
        id: "using-bun-x-with-bold-and-a-link",
        text: "Using bun x with bold and a link",
      },
    ]);
  });
});

describe("meta export", () => {
  const source = [
    "export const meta = {",
    '  title: "Hello",',
    "  nested: {",
    "    value: 1,",
    "  },",
    "};",
    "",
    "Body text.",
  ].join("\n");

  test("is detected when it starts with export const meta", () => {
    expect(hasMetaExport(source)).toBe(true);
    expect(hasMetaExport("Body only")).toBe(false);
  });

  test("is removed through the closing brace at column zero", () => {
    expect(removeMetaExport(source).trim()).toBe("Body text.");
  });
});

describe("reading time", () => {
  test("never reports less than one minute", () => {
    expect(readingTimeMinutes(0)).toBe(1);
    expect(readingTimeMinutes(10)).toBe(1);
  });

  test("rounds up past each 220 word boundary", () => {
    expect(readingTimeMinutes(220)).toBe(1);
    expect(readingTimeMinutes(221)).toBe(2);
    expect(readingTimeMinutes(440)).toBe(2);
    expect(readingTimeMinutes(441)).toBe(3);
  });

  test("counts prose and ignores code, imports and JSX tags", () => {
    const body = [
      'import image from "./image.png"',
      "",
      "One two three.",
      "",
      '<Callout tone="note">Four five</Callout>',
      "",
      "```ts",
      "const ignored = words in code",
      "```",
    ].join("\n");
    expect(countWords(body)).toBe(5);
  });

  test("counts words of a long body", () => {
    expect(countWords(words(500))).toBe(500);
  });
});

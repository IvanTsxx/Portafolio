import { describe, expect, test } from "bun:test";

import { stringifyMarkdown } from "./mdast";
import { mdxToMarkdownNodes } from "./mdx-to-markdown";

const convert = (source: string, scope = {}) =>
  stringifyMarkdown(mdxToMarkdownNodes(source, scope));

const source = `export const meta = {
  kind: "note",
  title: "Lanes",
};

import placeholder from "./media/blueprint-placeholder.png";

Intro with a <Kbd>key</Kbd> and \`code\`.

<Callout tone="warning" title="The stash is shared">
  Never pop a stash you did not push.
</Callout>

<Steps>
  <Step title="Define the tokens">Name every duration once.</Step>
  <Step title="Build the sequence">
    Scope each *timeline* to a ref.
  </Step>
</Steps>

<NoteList items={meta.motionNotes} />

<Figure alt="Blueprint grid" caption="Placeholder image." src={placeholder} />

<Diagram caption="Lanes share one repo." label="Three lanes on one repository">
  <svg viewBox="0 0 10 10"><text>{"main"}</text></svg>
</Diagram>

{/* hidden */}

\`\`\`tsx title="lane.tsx"
const lane = <Lane />;
\`\`\`

| Token | Value |
| ----- | ----- |
| fast  | 0.2 s |
`;

const scope = {
  meta: { motionNotes: ["One ease-out.", "Reduced motion is static."] },
};

describe("mdxToMarkdownNodes", () => {
  const markdown = convert(source, scope);

  test("drops module syntax and expressions", () => {
    expect(markdown).not.toContain("export const meta");
    expect(markdown).not.toContain("import placeholder");
    expect(markdown).not.toContain("hidden");
  });

  test("leaves no JSX outside code fences", () => {
    const outsideFences = markdown.replaceAll(/```[\s\S]*?```/gu, "");
    expect(outsideFences).not.toMatch(/<\/?[A-Za-z]/u);
  });

  test("unwraps unknown inline components", () => {
    expect(markdown).toContain("Intro with a key and `code`.");
  });

  test("turns a callout into a titled blockquote", () => {
    expect(markdown).toContain(
      "> **The stash is shared**\n>\n> Never pop a stash you did not push."
    );
  });

  test("turns steps into a numbered list with bold titles", () => {
    expect(markdown).toContain(
      "1. **Define the tokens**\n\n   Name every duration once."
    );
    expect(markdown).toContain(
      "2. **Build the sequence**\n\n   Scope each _timeline_ to a ref."
    );
  });

  test("resolves note lists from meta", () => {
    expect(markdown).toContain("- One ease-out.\n- Reduced motion is static.");
  });

  test("describes figures and diagrams in words", () => {
    expect(markdown).toContain("_Figure: Blueprint grid._ Placeholder image.");
    expect(markdown).toContain(
      "_Diagram: Three lanes on one repository._ Lanes share one repo."
    );
    expect(markdown).not.toContain("viewBox");
  });

  test("keeps code fences, their meta and GFM tables", () => {
    expect(markdown).toContain(
      '```tsx title="lane.tsx"\nconst lane = <Lane />;\n```'
    );
    expect(markdown).toContain("| fast  | 0.2 s |");
  });

  test("drops a note list whose meta key is missing", () => {
    expect(convert("<NoteList items={meta.missing} />", scope).trim()).toBe("");
  });
});

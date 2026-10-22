import { describe, expect, test } from "bun:test";

import { getNote, getNotes, getNoteSlugs } from "@/lib/content/notes";
import { experiments } from "@/lib/lab/experiments";
import { getRegistryItem, registryItems } from "@/lib/registry/registry";
import { skills } from "@/lib/skills/skills";

import {
  experimentMarkdown,
  noteMarkdown,
  registryItemMarkdown,
  toFrontMatter,
} from "./documents";
import { buildLlmsTxt, llmsSections } from "./llms";
import { assistantPrompt, openInTargets } from "./open-in";

const outsideFences = (markdown: string) =>
  markdown.replaceAll(/^```[\s\S]*?^```/gmu, "").replaceAll(/`[^`\n]*`/gu, "");

const frontMatterOf = (markdown: string) =>
  markdown.startsWith("---\n")
    ? markdown.slice(4, markdown.indexOf("\n---\n", 4))
    : "";

const noteSlugs = getNoteSlugs();

const noteDocuments = await Promise.all(
  noteSlugs.map(async (slug) => {
    const document = await getNote(slug);
    if (!document) {
      throw new Error(`missing note ${slug}`);
    }
    return [slug, noteMarkdown(document)] as const;
  })
);

describe("note markdown", () => {
  test.each(noteDocuments)("%s is clean Markdown", (slug, markdown) => {
    const header = frontMatterOf(markdown);
    expect(header).toContain('title: "');
    expect(header).toContain('summary: "');
    expect(header).toContain(`canonical: "https://bongi.dev/notes/${slug}"`);
    expect(header).toMatch(/^date: /mu);
    expect(header).toMatch(/^(?:tags|stack): \[/mu);
    expect(markdown).not.toContain("export const meta");
    expect(outsideFences(markdown)).not.toMatch(/<\/?[A-Za-z][\w.]*[\s/>]/u);
    expect(outsideFences(markdown)).not.toMatch(/^import /mu);
  });
});

describe("experiment markdown", () => {
  test.each(experiments.map((experiment) => [experiment.slug, experiment]))(
    "%s lists its implementation and notes",
    (slug, experiment) => {
      const markdown = experimentMarkdown(experiment);
      expect(frontMatterOf(markdown)).toContain(
        `canonical: "https://bongi.dev/experiments/${slug}"`
      );
      for (const line of [
        ...experiment.implementation,
        ...experiment.technicalNotes,
        ...experiment.technologies,
      ]) {
        expect(markdown).toContain(line);
      }
    }
  );
});

describe("registry markdown", () => {
  test.each(registryItems.map((item) => [item.name, item]))(
    "%s carries install commands, props and examples",
    (name, item) => {
      const markdown = registryItemMarkdown(item);
      expect(frontMatterOf(markdown)).toContain(
        `canonical: "https://bongi.dev/registry/${name}"`
      );
      expect(markdown).toContain(
        `npx shadcn@latest add https://bongi.dev/r/${name}.json`
      );
      expect(markdown).toContain(`npx shadcn@latest add @ivan/${name}`);
      for (const group of item.meta.docs.props) {
        expect(markdown).toContain(`### ${group.component}`);
      }
      for (const example of item.meta.docs.examples) {
        expect(markdown).toContain(`### ${example.title}`);
      }
    }
  );

  test("escapes union pipes inside table cells", () => {
    const item = getRegistryItem("magnetic-button");
    if (!item) {
      throw new Error("magnetic-button is missing");
    }
    const markdown = registryItemMarkdown(item);
    const variantRow = markdown
      .split("\n")
      .find((line) => line.startsWith("| `variant`"));
    expect(variantRow).toBeDefined();
    expect(variantRow?.split(/(?<!\\)\|/u)).toHaveLength(6);
  });
});

describe("toFrontMatter", () => {
  test("quotes values as YAML-safe JSON and skips undefined fields", () => {
    expect(
      toFrontMatter([
        ["title", 'Colons: and "quotes"'],
        ["tags", ["a", "b"]],
        ["source", undefined],
        ["year", 2026],
      ])
    ).toBe(
      '---\ntitle: "Colons: and \\"quotes\\""\ntags: ["a","b"]\nyear: 2026\n---\n'
    );
  });
});

const notes = await getNotes();

describe("llms.txt", () => {
  const llms = buildLlmsTxt(
    llmsSections({ experiments, notes, registryItems, skills })
  );

  test("links every indexable note, experiment, registry item and skill as .md", () => {
    const expected = [
      ...notes.flatMap((note) =>
        note.sample ? [] : [`https://bongi.dev/notes/${note.slug}.md`]
      ),
      ...experiments.map(
        (experiment) => `https://bongi.dev/experiments/${experiment.slug}.md`
      ),
      ...registryItems.map(
        (item) => `https://bongi.dev/registry/${item.name}.md`
      ),
      ...skills.map((skill) => `https://bongi.dev/skills/${skill.name}.md`),
    ];
    for (const url of expected) {
      expect(llms).toContain(`](${url}): `);
    }
  });

  test("leaves out sample notes and dev routes", () => {
    for (const note of notes.filter((entry) => entry.sample)) {
      expect(llms).not.toContain(`/notes/${note.slug}`);
    }
    expect(llms).not.toContain("/dev");
  });

  test("opens with the site name and summary", () => {
    expect(llms).toMatch(/^# Ivo\n\n> /u);
  });
});

describe("open in targets", () => {
  test("encode a prompt that points at the absolute .md URL", () => {
    expect(assistantPrompt("/notes/lanes.md")).toBe(
      "Read https://bongi.dev/notes/lanes.md and help me with it"
    );
    const encoded = encodeURIComponent(assistantPrompt("/notes/lanes.md"));
    expect(
      Object.fromEntries(
        openInTargets("/notes/lanes.md").map((target) => [
          target.id,
          target.href,
        ])
      )
    ).toEqual({
      chatgpt: `https://chatgpt.com/?hints=search&q=${encoded}`,
      claude: `https://claude.ai/new?q=${encoded}`,
      perplexity: `https://www.perplexity.ai/search?q=${encoded}`,
    });
  });
});

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { FieldNote } from "@/lib/content/note-domain";
import { registryItems } from "@/lib/registry/registry";
import { homeSections, siteConfig } from "@/lib/site/config";

import {
  channelEntries,
  experimentEntry,
  homeSectionEntries,
  noteEntry,
  pageEntries,
  registryEntry,
  sectionEntries,
} from "./entries";
import type { SearchEntry } from "./types";

const profileDirectory = path.join(process.cwd(), "components", "profile");

const profileSources = readdirSync(profileDirectory, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => readFileSync(path.join(profileDirectory, file), "utf-8"))
  .join("\n");

const note: FieldNote = {
  date: "2026-10-09",
  kind: "note",
  readingTimeMinutes: 3,
  related: [],
  sample: false,
  slug: "worktrees-as-lanes",
  summary: "One worktree per issue.",
  tags: ["Conductor", "Workflow"],
  title: "Worktrees as lanes",
  wordCount: 600,
};

describe("home section entries", () => {
  test("every home anchor exists in the profile components", () => {
    for (const section of homeSections) {
      expect(profileSources).toContain(`id="${section.id}"`);
    }
  });

  test("link to the matching anchor on the home page", () => {
    expect(homeSectionEntries().map((entry) => entry.action)).toEqual(
      homeSections.map((section) => ({
        href: `/#${section.id}`,
        type: "route",
      }))
    );
  });

  test("name the page a section lives on", () => {
    const [first] = sectionEntries("Design system", "/design-system", [
      { id: "color", index: "DS-02", jp: "色彩", label: "Color tokens" },
    ]);

    expect(first).toMatchObject({
      action: { href: "/design-system#color", type: "route" },
      detail: "Design system",
      group: "sections",
      title: "Color tokens",
    });
  });
});

describe("content entries", () => {
  test("a note shows its kind and tags and searches its summary", () => {
    expect(noteEntry(note, 0)).toMatchObject({
      action: { href: "/notes/worktrees-as-lanes", type: "route" },
      code: "NT-01",
      detail: "Note · Conductor, Workflow",
      group: "notes",
      title: "Worktrees as lanes",
    });
    expect(noteEntry(note, 0).keywords).toContain("One worktree per issue.");
  });

  test("an experiment links to its lab page and searches its technologies", () => {
    const entry = experimentEntry({
      index: "LAB-01",
      slug: "dither-field",
      summary: "Bayer dithering.",
      technologies: ["GLSL"],
      title: "Dither field",
      topics: ["Shader", "WebGL"],
      year: 2026,
    });

    expect(entry).toMatchObject({
      action: { href: "/lab/dither-field", type: "route" },
      code: "LAB-01",
      detail: "Shader, WebGL",
      group: "lab",
    });
    expect(entry.keywords).toEqual(["Bayer dithering.", "GLSL", "2026"]);
  });

  test("a registry item links to its docs page", () => {
    const [item] = registryItems;
    if (!item) {
      throw new Error("registry has no items");
    }

    expect(registryEntry(item, 2)).toMatchObject({
      action: { href: `/registry/${item.name}`, type: "route" },
      code: "R-03",
      detail: item.categories.join(", "),
      group: "registry",
      title: item.title,
    });
  });
});

describe("channel entries", () => {
  test("the email entry copies the address instead of opening mail", () => {
    const email = channelEntries().find(
      (entry) => entry.id === "channel:email"
    );

    expect(email?.action).toEqual({ type: "copy", value: siteConfig.email });
    expect(email?.title).toBe("Copy email");
  });

  test("social entries open in a new tab", () => {
    const github = channelEntries().find(
      (entry) => entry.id === "channel:github"
    );

    expect(github?.action).toEqual({
      href: "https://github.com/IvanTsxx",
      type: "external",
    });
  });
});

describe("the whole index", () => {
  const entries: SearchEntry[] = [
    ...pageEntries(),
    ...homeSectionEntries(),
    noteEntry(note, 0),
    ...channelEntries(),
  ];

  test("gives every entry a unique id", () => {
    const ids = entries.map((entry) => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test("never spells the surname in anything the palette renders or searches", () => {
    const text = entries
      .flatMap((entry) => [entry.title, entry.detail, ...entry.keywords])
      .join("\n");

    expect(text).not.toContain("Bongiovanni");
  });
});

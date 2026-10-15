import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { z } from "zod";

import { ContentError, createCollection } from "./collection";
import type { MdxModule } from "./collection";

const metaSchema = z.strictObject({
  order: z.number(),
  title: z.string().min(1),
});

type Meta = z.infer<typeof metaSchema>;

type FixtureMeta = Record<string, number | string>;

const metaExport = (meta: FixtureMeta) =>
  `export const meta = ${JSON.stringify(meta, null, 2)};\n`;

const words = (count: number) =>
  Array.from({ length: count }, () => "word").join(" ");

let directory = "";
let metas: Record<string, FixtureMeta> = {};

const writeEntry = async (
  slug: string,
  meta: FixtureMeta,
  body = "Body text."
) => {
  metas[slug] = meta;
  const source = `${metaExport(meta)}\n${body}\n`;
  await writeFile(path.join(directory, `${slug}.mdx`), source);
};

const buildCollection = (findIssues?: (entries: readonly Meta[]) => string[]) =>
  createCollection<Meta>({
    compare: (a, b) => a.order - b.order,
    directoryPath: directory,
    findIssues,
    importModule: (slug): Promise<MdxModule> =>
      Promise.resolve({ default: () => null, meta: metas[slug] }),
    label: "fixtures",
    metaSchema,
  });

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "content-collection-"));
  metas = {};
});

afterEach(async () => {
  await rm(directory, { force: true, recursive: true });
});

describe("list", () => {
  test("returns entries sorted by the collection comparator, not by file name", async () => {
    await writeEntry("alpha", { order: 3, title: "Alpha" });
    await writeEntry("bravo", { order: 1, title: "Bravo" });
    await writeEntry("charlie", { order: 2, title: "Charlie" });

    const entries = await buildCollection().list();

    expect(entries.map((entry) => entry.slug)).toEqual([
      "bravo",
      "charlie",
      "alpha",
    ]);
  });

  test("derives the slug from the file name and ignores other files", async () => {
    await writeEntry("only-entry", { order: 1, title: "Only" });
    await writeFile(path.join(directory, "notes.txt"), "not content");

    const entries = await buildCollection().list();

    expect(entries.map((entry) => entry.slug)).toEqual(["only-entry"]);
  });

  test("computes reading time from the body and not from the meta block", async () => {
    await writeEntry("short", { order: 1, title: "Short" }, words(100));
    await writeEntry("long", { order: 2, title: "Long" }, words(450));

    const [short, long] = await buildCollection().list();

    expect(short?.wordCount).toBe(100);
    expect(short?.readingTimeMinutes).toBe(1);
    expect(long?.wordCount).toBe(450);
    expect(long?.readingTimeMinutes).toBe(3);
  });

  test("rejects invalid meta and names the file and the field", async () => {
    await writeEntry("broken", { order: "first", title: "" });

    const failure = buildCollection().list();

    await expect(failure).rejects.toBeInstanceOf(ContentError);
    await expect(failure).rejects.toThrow(/broken\.mdx/u);
    await expect(failure).rejects.toThrow(/title/u);
  });

  test("rejects unknown meta keys", async () => {
    await writeEntry("typo", { order: 1, title: "Typo", tittle: "oops" });

    await expect(buildCollection().list()).rejects.toThrow(/typo\.mdx/u);
  });

  test("rejects a file without a meta export at column zero", async () => {
    metas.nometa = { order: 1, title: "No meta" };
    await writeFile(path.join(directory, "nometa.mdx"), "Just a body.\n");

    await expect(buildCollection().list()).rejects.toThrow(
      /export const meta/u
    );
  });

  test("rejects file names that cannot be URL slugs", async () => {
    await writeEntry("Not_A_Slug", { order: 1, title: "Bad name" });

    await expect(buildCollection().list()).rejects.toThrow(/URL slugs/u);
  });

  test("fails with every cross-entry issue the collection reports", async () => {
    await writeEntry("alpha", { order: 1, title: "Alpha" });

    const failure = buildCollection(() => ["alpha points nowhere"]).list();

    await expect(failure).rejects.toThrow(/alpha points nowhere/u);
  });
});

describe("getBySlug", () => {
  test("returns the entry, its headings and a renderable component", async () => {
    await writeEntry(
      "post",
      { order: 1, title: "Post" },
      "## First\n\ntext\n\n### Nested\n"
    );

    const document = await buildCollection().getBySlug("post");

    expect(document?.entry.title).toBe("Post");
    expect(document?.headings.map((heading) => heading.id)).toEqual([
      "first",
      "nested",
    ]);
    expect(document?.Content).toBeInstanceOf(Function);
  });

  test("returns undefined for an unknown slug", async () => {
    await writeEntry("post", { order: 1, title: "Post" });

    expect(await buildCollection().getBySlug("missing")).toBeUndefined();
  });

  test("returns undefined for slugs that try to leave the directory", async () => {
    await writeEntry("post", { order: 1, title: "Post" });

    const collection = buildCollection();

    expect(await collection.getBySlug("../post")).toBeUndefined();
    expect(await collection.getBySlug("post/../post")).toBeUndefined();
  });
});

describe("slugs", () => {
  test("lists every slug in alphabetical order", async () => {
    await writeEntry("zulu", { order: 1, title: "Zulu" });
    await writeEntry("alpha", { order: 2, title: "Alpha" });

    expect(buildCollection().slugs()).toEqual(["alpha", "zulu"]);
  });
});

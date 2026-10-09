import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import { z } from "zod";

import { slugPattern } from "./schema";
import {
  countWords,
  extractHeadings,
  hasMetaExport,
  readingTimeMinutes,
  removeMetaExport,
} from "./text";
import type { Heading } from "./text";

export interface MdxModule {
  default: ComponentType<{ components?: MDXComponents }>;
  meta?: unknown;
}

export type ContentEntry<Meta> = Meta & {
  readingTimeMinutes: number;
  slug: string;
  wordCount: number;
};

export interface ContentDocument<Meta> {
  Content: MdxModule["default"];
  entry: ContentEntry<Meta>;
  headings: readonly Heading[];
}

export interface CollectionConfig<Meta> {
  compare: (a: ContentEntry<Meta>, b: ContentEntry<Meta>) => number;
  directoryPath: string;
  findIssues?: (entries: readonly ContentEntry<Meta>[]) => string[];
  importModule: (slug: string) => Promise<MdxModule>;
  label: string;
  metaSchema: z.ZodType<Meta>;
}

export interface Collection<Meta> {
  getBySlug: (slug: string) => Promise<ContentDocument<Meta> | undefined>;
  list: () => Promise<ContentEntry<Meta>[]>;
  slugs: () => Promise<string[]>;
}

export class ContentError extends Error {
  override name = "ContentError";
}

const extension = ".mdx";

export const createCollection = <Meta extends object>(
  config: CollectionConfig<Meta>
): Collection<Meta> => {
  const filePathFor = (slug: string) =>
    path.join(config.directoryPath, `${slug}${extension}`);

  const labelFor = (slug: string) => `${config.label}/${slug}${extension}`;

  const slugs = async () => {
    const files = await readdir(config.directoryPath);
    const names: string[] = [];
    for (const file of files.toSorted()) {
      if (!file.endsWith(extension)) {
        continue;
      }
      const name = file.slice(0, -extension.length);
      if (!slugPattern.test(name)) {
        throw new ContentError(
          `${labelFor(name)}: file names become URL slugs, so use lowercase letters, digits and single hyphens`
        );
      }
      names.push(name);
    }
    return names.toSorted();
  };

  const load = async (slug: string): Promise<ContentDocument<Meta>> => {
    const [module, source] = await Promise.all([
      config.importModule(slug),
      readFile(filePathFor(slug), "utf-8"),
    ]);

    if (!hasMetaExport(source)) {
      throw new ContentError(
        `${labelFor(slug)}: start the file with "export const meta = {" and close it with "}" at column 0`
      );
    }

    const parsed = config.metaSchema.safeParse(module.meta);
    if (!parsed.success) {
      throw new ContentError(
        `${labelFor(slug)}: invalid meta\n${z.prettifyError(parsed.error)}`
      );
    }

    const body = removeMetaExport(source);
    const wordCount = countWords(body);

    return {
      Content: module.default,
      entry: {
        ...parsed.data,
        readingTimeMinutes: readingTimeMinutes(wordCount),
        slug,
        wordCount,
      },
      headings: extractHeadings(body),
    };
  };

  const list = async () => {
    const documentSlugs = await slugs();
    const documents = await Promise.all(documentSlugs.map(load));
    const entries = documents.map((document) => document.entry);
    const issues = config.findIssues?.(entries) ?? [];
    if (issues.length > 0) {
      throw new ContentError(`${config.label}: ${issues.join("; ")}`);
    }
    return entries.toSorted(config.compare);
  };

  const getBySlug = async (slug: string) => {
    if (!slugPattern.test(slug)) {
      return;
    }
    const knownSlugs = await slugs();
    return knownSlugs.includes(slug) ? load(slug) : undefined;
  };

  return { getBySlug, list, slugs };
};

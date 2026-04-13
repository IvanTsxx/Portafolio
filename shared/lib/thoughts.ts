import "server-only";
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_LIFE, CACHE_TAGS } from "@/shared/lib/cache";
import type { Thought } from "@/shared/types/thought";

interface ReadingTimeOptions {
  textWPM?: number;
  codeWPM?: number;
  imageSeconds?: number;
}

export function estimateReadingTime(
  content: string,
  options: ReadingTimeOptions = {}
): number {
  const { textWPM = 150, codeWPM = 70, imageSeconds = 12 } = options;

  if (!content || !content.trim()) return 1;

  // 1. remover frontmatter
  let clean = content.replace(/^---[\s\S]*?---/, "");

  // 2. extraer bloques de código
  const codeBlocks = clean.match(/```[\s\S]*?```/g) || [];
  clean = clean.replaceAll(/```[\s\S]*?```/g, "");

  // 3. contar imágenes
  const images = (clean.match(/!\[.*?\]\(.*?\)/g) || []).length;

  // 4. limpiar markdown
  const text = clean
    .replaceAll(/`[^`]*`/g, "")
    .replaceAll(/[#>*_()[\]]/g, "")
    .replaceAll(/\n+/g, " ");

  // 5. contar palabras de texto
  let words = 0;
  for (const part of text.trim().split(/\s+/)) {
    if (part) words += 1;
  }

  // 6. contar palabras de código
  let codeWords = 0;

  for (const blockRaw of codeBlocks) {
    const block = blockRaw.replaceAll("```", "").trim().split(/\s+/);

    for (const token of block) {
      if (token) codeWords += 1;
    }
  }

  // 7. penalización por listas (cap)
  const listItems = (content.match(/^\s*[-*]\s+/gm) || []).length;

  let listAdjustment = listItems * 0.1;
  if (listAdjustment > 1.5) listAdjustment = 1.5;

  // 8. cálculo final
  const textTime = words / textWPM;
  const codeTime = codeWords / codeWPM;
  const imageTime = (images * imageSeconds) / 60;

  const totalMinutes = textTime + codeTime + imageTime - listAdjustment;

  return Math.max(1, Math.round(totalMinutes));
}

const THOUGHTS_DIR = path.join(process.cwd(), "content", "thoughts");

/**
 * Get all available language directories in the thoughts folder.
 * Each subdirectory represents a language (en, es, pt, etc.)
 */
function getAvailableLangs(): string[] {
  if (!fs.existsSync(THOUGHTS_DIR)) return ["en"];

  const entries = fs.readdirSync(THOUGHTS_DIR, { withFileTypes: true });
  const langs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^[a-z]{2}$/.test(name));

  return langs.length > 0 ? langs : ["en"];
}

/**
 * Get all MDX/MD files from all language directories.
 * Returns array of { lang, fileName, filePath }
 */
function getAllLangFiles(): {
  lang: string;
  fileName: string;
  filePath: string;
}[] {
  const langs = getAvailableLangs();
  const files: { lang: string; fileName: string; filePath: string }[] = [];

  for (const lang of langs) {
    const langDir = path.join(THOUGHTS_DIR, lang);
    if (!fs.existsSync(langDir)) continue;

    const langFiles = fs
      .readdirSync(langDir)
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    for (const fileName of langFiles) {
      files.push({
        fileName,
        filePath: path.join(langDir, fileName),
        lang,
      });
    }
  }

  return files;
}

/**
 * Build a map of slug -> available languages.
 * This groups files by their base name (without extension).
 */
function getSlugToLangsMap(): Map<string, string[]> {
  const files = getAllLangFiles();
  const slugMap = new Map<string, string[]>();

  for (const { lang, fileName } of files) {
    const slug = fileName.replace(/\.(mdx|md)$/, "");
    const existing = slugMap.get(slug) || [];
    slugMap.set(slug, [...existing, lang]);
  }

  return slugMap;
}

export async function getAllThoughts(): Promise<Thought[]> {
  "use cache";
  cacheLife(CACHE_LIFE.GET_ALL_THOUGHTS);
  cacheTag(CACHE_TAGS.GET_ALL_THOUGHTS);

  if (!fs.existsSync(THOUGHTS_DIR)) return [];

  const files = getAllLangFiles();
  const slugMap = getSlugToLangsMap();
  const defaultLang = "en";

  const thoughts: Thought[] = [];

  // Group files by slug
  const slugGroups = new Map<string, typeof files>();

  for (const file of files) {
    const slug = file.fileName.replace(/\.(mdx|md)$/, "");
    const group = slugGroups.get(slug) || [];
    group.push(file);
    slugGroups.set(slug, group);
  }

  // For each slug, load the default lang version
  for (const [slug, group] of slugGroups) {
    // Find the default lang version, fallback to first available
    const targetFile =
      group.find((f) => f.lang === defaultLang) || group[0];

    const raw = fs.readFileSync(targetFile.filePath, "utf-8");
    const { data, content } = matter(raw);

    if (data.published === false) continue;

    const availableLangs = slugMap.get(slug) || [];

    thoughts.push({
      availableLangs,
      content,
      date: data.date ?? "2025-01-01",
      description: data.description ?? "",
      lang: targetFile.lang,
      published: data.published !== false,
      readingTime:
        typeof data.readingTime === "number"
          ? data.readingTime
          : estimateReadingTime(content),
      slug,
      tags: Array.isArray(data.tags) ? data.tags : [],
      title: data.title ?? "Untitled",
    });
  }

  return thoughts.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getThoughtBySlug(
  slug: string,
  lang?: string
): Promise<Thought | undefined> {
  "use cache";
  cacheLife(CACHE_LIFE.GET_THOUGHT_BY_ID);
  cacheTag(CACHE_TAGS.GET_THOUGHT_BY_ID(slug), CACHE_TAGS.GET_ALL_THOUGHTS);

  const files = getAllLangFiles();
  const slugMap = getSlugToLangsMap();
  const targetLang = lang || "en";

  // Find the file for this slug + lang
  const match = files.find(
    (f) =>
      f.fileName.replace(/\.(mdx|md)$/, "") === slug && f.lang === targetLang
  );

  if (!match) {
    // Fallback: try default lang if target not found
    const fallback = files.find(
      (f) => f.fileName.replace(/\.(mdx|md)$/, "") === slug && f.lang === "en"
    );
    if (!fallback) return undefined;

    const raw = fs.readFileSync(fallback.filePath, "utf-8");
    const { data, content } = matter(raw);

    if (data.published === false) return undefined;

    return {
      availableLangs: slugMap.get(slug) || [],
      content,
      date: data.date ?? "2025-01-01",
      description: data.description ?? "",
      lang: fallback.lang,
      published: data.published !== false,
      readingTime:
        typeof data.readingTime === "number"
          ? data.readingTime
          : estimateReadingTime(content),
      slug,
      tags: Array.isArray(data.tags) ? data.tags : [],
      title: data.title ?? "Untitled",
    };
  }

  const raw = fs.readFileSync(match.filePath, "utf-8");
  const { data, content } = matter(raw);

  if (data.published === false) return undefined;

  return {
    availableLangs: slugMap.get(slug) || [],
    content,
    date: data.date ?? "2025-01-01",
    description: data.description ?? "",
    lang: match.lang,
    published: data.published !== false,
    readingTime:
      typeof data.readingTime === "number"
        ? data.readingTime
        : estimateReadingTime(content),
    slug,
    tags: Array.isArray(data.tags) ? data.tags : [],
    title: data.title ?? "Untitled",
  };
}

export async function getAllTags(): Promise<string[]> {
  "use cache";
  cacheLife(CACHE_LIFE.GET_ALL_TAGS);
  cacheTag(CACHE_TAGS.GET_ALL_TAGS);

  // oxlint-disable-next-line unicorn/no-await-expression-member
  const all = (await getAllThoughts()).flatMap((t) => t.tags);
  return [...new Set(all)].toSorted();
}

export async function getRecentThoughts(): Promise<Thought[]> {
  "use cache";
  cacheLife(CACHE_LIFE.GET_RECENT_THOUGHTS);
  cacheTag(CACHE_TAGS.GET_RECENT_THOUGHTS);

  const allThoughts = await getAllThoughts();
  return allThoughts.slice(0, 3);
}

/**
 * Get related thoughts based on shared tags with the current post.
 * Returns up to 3 posts that share at least one tag, excluding the current post.
 * Prioritizes posts with more tag matches.
 */
export async function getRelatedThoughts(
  currentSlug: string,
  limit = 3
): Promise<Thought[]> {
  "use cache";
  cacheLife(CACHE_LIFE.GET_RECENT_THOUGHTS);
  cacheTag(CACHE_TAGS.GET_ALL_THOUGHTS);

  const allThoughts = await getAllThoughts();
  const currentThought = allThoughts.find((t) => t.slug === currentSlug);

  if (!currentThought || currentThought.tags.length === 0) {
    return [];
  }

  // Score each post by number of matching tags
  const scored = allThoughts
    .filter((t) => t.slug !== currentSlug)
    .map((t) => {
      const sharedTags = t.tags.filter((tag) =>
        currentThought.tags.includes(tag)
      );
      return { score: sharedTags.length, thought: t };
    })
    .filter((item) => item.score > 0)
    .toSorted((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.thought);
}

/**
 * Get available languages for a specific slug.
 * Useful for showing language switcher in the post detail.
 */
export async function getAvailableLangsForSlug(
  slug: string
): Promise<string[]> {
  const slugMap = getSlugToLangsMap();
  return slugMap.get(slug) || [];
}

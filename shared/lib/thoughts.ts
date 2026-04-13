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

export async function getAllThoughts(): Promise<Thought[]> {
  "use cache";
  cacheLife(CACHE_LIFE.GET_ALL_THOUGHTS);
  cacheTag(CACHE_TAGS.GET_ALL_THOUGHTS);

  if (!fs.existsSync(THOUGHTS_DIR)) return [];

  const files = fs
    .readdirSync(THOUGHTS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const thoughts: Thought[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(THOUGHTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    if (data.published === false) continue;

    thoughts.push({
      content,
      date: data.date ?? "2025-01-01",
      description: data.description ?? "",
      published: data.published !== false,
      readingTime:
        typeof data.readingTime === "number"
          ? data.readingTime
          : estimateReadingTime(content),
      slug: file.replace(/\.(mdx|md)$/, ""),
      tags: Array.isArray(data.tags) ? data.tags : [],
      title: data.title ?? "Untitled",
    });
  }

  return thoughts.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getThoughtBySlug(
  slug: string
): Promise<Thought | undefined> {
  "use cache";
  cacheLife(CACHE_LIFE.GET_THOUGHT_BY_ID);
  cacheTag(CACHE_TAGS.GET_THOUGHT_BY_ID(slug), CACHE_TAGS.GET_ALL_THOUGHTS);

  // oxlint-disable-next-line unicorn/no-await-expression-member
  return (await getAllThoughts()).find((t) => t.slug === slug);
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
      return { thought: t, score: sharedTags.length };
    })
    .filter((item) => item.score > 0)
    .toSorted((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.thought);
}

import "server-only";
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

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

export function getAllThoughts(): Thought[] {
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

export function getThoughtBySlug(slug: string): Thought | undefined {
  return getAllThoughts().find((t) => t.slug === slug);
}

export function getAllTags(): string[] {
  const all = getAllThoughts().flatMap((t) => t.tags);
  return [...new Set(all)].toSorted();
}

export function getRecentThoughts(): Thought[] {
  const dir = path.join(process.cwd(), "content", "thoughts");
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const thoughts: Thought[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    if (data.published === false) continue;

    thoughts.push({
      content,
      date: data.date ?? "2025-01-01",
      description: data.description ?? "",
      published: data.published !== false,
      readingTime: estimateReadingTime(content),
      slug: file.replace(/\.(mdx|md)$/, ""),
      tags: data.tags ?? [],
      title: data.title ?? "Untitled",
    });
  }

  // Sort newest first, take top 3
  return thoughts.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

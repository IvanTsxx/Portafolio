import type { PinnedRepository } from "@/lib/github/model";

export const bookTones = ["paper", "deep", "graphite", "steel"] as const;

export type BookTone = (typeof bookTones)[number];

const languageTones = new Map<string, BookTone>([
  ["JavaScript", "graphite"],
  ["Python", "steel"],
  ["TypeScript", "paper"],
]);

export const toneOfLanguage = (language: string | null): BookTone =>
  (language ? languageTones.get(language) : undefined) ?? "deep";

export interface ShelfBook {
  description: string | null;
  id: string;
  language: string | null;
  name: string;
  stars: number;
  tone: BookTone;
  url: string;
}

const spineLineLimit = 14;

export const spineLines = (name: string): readonly string[] => {
  if (name.length <= spineLineLimit) {
    return [name];
  }
  const middle = name.length / 2;
  let split = -1;
  for (const [index, character] of [...name].entries()) {
    const isBreak = character === "-" || character === "_";
    if (
      isBreak &&
      (split < 0 || Math.abs(index - middle) < Math.abs(split - middle))
    ) {
      split = index;
    }
  }
  return split < 0 ? [name] : [name.slice(0, split + 1), name.slice(split + 1)];
};

export const buildShelf = (
  repositories: readonly PinnedRepository[]
): ShelfBook[] =>
  repositories.map((repository) => ({
    description: repository.description,
    id: repository.nameWithOwner,
    language: repository.language,
    name: repository.name,
    stars: repository.stars,
    tone: toneOfLanguage(repository.language),
    url: `https://github.com/${repository.nameWithOwner}`,
  }));

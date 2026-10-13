import type { PinnedRepository } from "@/lib/github/model";

export const MOST_NOTCHES = 8;
const LEAST_NOTCHES = 5;
const CHARACTERS_PER_RULE = 56;
const MOST_DESCRIPTION_RULES = 3;
const LONGEST_NAME = 28;

export interface LanguageCount {
  count: number;
  language: string;
}

export interface CatalogCard {
  description: string | null;
  descriptionRules: readonly number[];
  id: string;
  isTemplate: boolean;
  language: string;
  name: string;
  nameRule: number;
  stars: number;
  tab: number;
  url: string;
}

export interface Catalog {
  cards: readonly CatalogCard[];
  languages: readonly LanguageCount[];
  notches: number;
  stars: number;
}

const languageOf = (repository: PinnedRepository) =>
  repository.language ?? "Unknown";

export const languageCounts = (
  repositories: readonly PinnedRepository[]
): LanguageCount[] => {
  const counts = new Map<string, number>();
  for (const repository of repositories) {
    const language = languageOf(repository);
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  return [...counts]
    .map(([language, count]) => ({ count, language }))
    .toSorted(
      (a, b) => b.count - a.count || a.language.localeCompare(b.language)
    );
};

export const descriptionRules = (description: string | null): number[] => {
  const length = description?.trim().length ?? 0;
  const rules: number[] = [];
  let left = length;
  while (left > 0 && rules.length < MOST_DESCRIPTION_RULES) {
    rules.push(Math.min(1, left / CHARACTERS_PER_RULE));
    left -= CHARACTERS_PER_RULE;
  }
  return rules;
};

export const catalogOf = (
  repositories: readonly PinnedRepository[]
): Catalog => {
  const languages = languageCounts(repositories);
  const tabOf = new Map(
    languages.map((entry, index) => [entry.language, index])
  );
  const cards = repositories.map(
    (repository): CatalogCard => ({
      description: repository.description,
      descriptionRules: descriptionRules(repository.description),
      id: repository.nameWithOwner,
      isTemplate: repository.visibility === "public-template",
      language: languageOf(repository),
      name: repository.name,
      nameRule: Math.min(1, repository.name.length / LONGEST_NAME),
      stars: repository.stars,
      tab: tabOf.get(languageOf(repository)) ?? 0,
      url: `https://github.com/${repository.nameWithOwner}`,
    })
  );
  const mostStars = Math.max(0, ...cards.map((card) => card.stars));
  return {
    cards,
    languages,
    notches: Math.min(MOST_NOTCHES, Math.max(LEAST_NOTCHES, mostStars)),
    stars: cards.reduce((sum, card) => sum + card.stars, 0),
  };
};

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const starsText = (stars: number) => plural(stars, "star", "stars");

export const cardDetail = (card: CatalogCard) =>
  `${card.language} · ${starsText(card.stars)}${card.isTemplate ? " · template" : ""}`;

export const catalogTitle = (catalog: Catalog) =>
  `${plural(catalog.cards.length, "card", "cards")} · ${starsText(catalog.stars)}`;

export const languageText = (catalog: Catalog) =>
  catalog.languages
    .map((entry) => `${entry.language} ${entry.count}`)
    .join(" · ");

export const spokenCard = (card: CatalogCard) =>
  `${card.name}. ${cardDetail(card)}.${card.description ? ` ${card.description}` : ""}`;

export const focusLine = (card: CatalogCard) =>
  `${card.name} · ${cardDetail(card)}`;

import type { DossierFile } from "@/components/profile/dossier-file";
import { fileCode, formatDay, hostOf } from "@/components/profile/dossier-file";
import type {
  PinnedRepository,
  RepositoryVisibility,
} from "@/lib/github/model";

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
  createdAt: string;
  description: string | null;
  descriptionRules: readonly number[];
  forks: number;
  homepage: string | null;
  id: string;
  isTemplate: boolean;
  language: string;
  name: string;
  nameRule: number;
  pushedAt: string;
  stars: number;
  tab: number;
  topics: readonly string[];
  url: string;
  visibility: RepositoryVisibility;
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
  const cards = repositories.map((repository): CatalogCard => ({
    createdAt: repository.createdAt,
    description: repository.description,
    descriptionRules: descriptionRules(repository.description),
    forks: repository.forks,
    homepage: repository.homepage,
    id: repository.nameWithOwner,
    isTemplate: repository.visibility === "public-template",
    language: languageOf(repository),
    name: repository.name,
    nameRule: Math.min(1, repository.name.length / LONGEST_NAME),
    pushedAt: repository.pushedAt,
    stars: repository.stars,
    tab: tabOf.get(languageOf(repository)) ?? 0,
    topics: repository.topics,
    url: `https://github.com/${repository.nameWithOwner}`,
    visibility: repository.visibility,
  }));
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

export const cardLine = (card: CatalogCard) =>
  card.description ?? cardDetail(card);

export const tourStepOf = (step: number, count: number, readEvery: number) => ({
  reads: (step + 1) % readEvery === 0,
  slot: step % count,
});

const visibilityLabels = {
  private: "Private",
  public: "Public",
  "public-template": "Public template",
} as const satisfies Record<RepositoryVisibility, string>;

export const repositoryFile = (
  card: CatalogCard,
  slot: number,
  count: number,
  section: string
): DossierFile => ({
  chips:
    card.topics.length > 0 ? { items: card.topics, label: "Topics" } : null,
  code: fileCode(section, slot, count),
  fields: [
    { label: "Language", value: card.language },
    { label: "Stars", value: String(card.stars) },
    { label: "Forks", value: String(card.forks) },
    { label: "Visibility", value: visibilityLabels[card.visibility] },
    { label: "Created", value: formatDay(card.createdAt) },
    { label: "Last push", value: formatDay(card.pushedAt) },
  ],
  kicker: card.id,
  links: [
    { href: card.url, label: "GitHub" },
    ...(card.homepage
      ? [{ href: card.homepage, label: hostOf(card.homepage) }]
      : []),
  ],
  note: card.description
    ? { label: "Description", text: card.description }
    : null,
  title: card.name,
});

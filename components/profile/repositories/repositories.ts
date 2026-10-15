import type { DossierFile } from "@/components/profile/dossier-file";
import { fileCode, formatDay, hostOf } from "@/components/profile/dossier-file";
import type {
  PinnedRepository,
  RepositoryVisibility,
} from "@/lib/github/model";

const VISIBLE_TOPICS = 3;

export const swatchTones = ["ink", "graphite", "mist", "hollow"] as const;

export type SwatchTone = (typeof swatchTones)[number];

export interface RepositorySpecimen {
  description: string | null;
  file: DossierFile;
  forks: number;
  id: string;
  index: number;
  language: string;
  languageCode: string;
  name: string;
  owner: string;
  pushed: string;
  pushedOn: string;
  spoken: string;
  stars: number;
  swatch: SwatchTone;
  topics: readonly string[];
  topicsLeft: number;
  url: string;
  visibility: string;
}

const visibilityLabels = {
  private: "Private",
  public: "Public",
  "public-template": "Public template",
} as const satisfies Record<RepositoryVisibility, string>;

const languageOf = (repository: PinnedRepository) =>
  repository.language ?? "Unknown";

const languageCodes = new Map([
  ["Go", "GO"],
  ["JavaScript", "JS"],
  ["Python", "PY"],
  ["Rust", "RS"],
  ["TypeScript", "TS"],
  ["Unknown", "XX"],
]);

const languageCodeOf = (language: string) =>
  languageCodes.get(language) ?? language.slice(0, 2).toUpperCase();

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const swatchesOf = (
  repositories: readonly PinnedRepository[]
): ReadonlyMap<string, SwatchTone> => {
  const counts = new Map<string, number>();
  for (const repository of repositories) {
    const language = languageOf(repository);
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  const ranked = [...counts].toSorted(
    ([firstLanguage, firstCount], [secondLanguage, secondCount]) =>
      secondCount - firstCount || firstLanguage.localeCompare(secondLanguage)
  );
  return new Map(
    ranked.map(([language], rank) => [
      language,
      swatchTones[Math.min(rank, swatchTones.length - 1)] ?? "hollow",
    ])
  );
};

const fileOf = (
  repository: PinnedRepository,
  url: string,
  code: string
): DossierFile => ({
  chips:
    repository.topics.length > 0
      ? { items: repository.topics, label: "Topics" }
      : null,
  code,
  fields: [
    { label: "Language", value: languageOf(repository) },
    { label: "Stars", value: String(repository.stars) },
    { label: "Forks", value: String(repository.forks) },
    { label: "Visibility", value: visibilityLabels[repository.visibility] },
    { label: "Created", value: formatDay(repository.createdAt) },
    { label: "Last push", value: formatDay(repository.pushedAt) },
  ],
  kicker: repository.nameWithOwner,
  links: [
    { href: url, label: "GitHub" },
    ...(repository.homepage
      ? [{ href: repository.homepage, label: hostOf(repository.homepage) }]
      : []),
  ],
  note: repository.description
    ? { label: "Description", text: repository.description }
    : null,
  title: repository.name,
});

export const specimensOf = (
  repositories: readonly PinnedRepository[],
  section: string
): RepositorySpecimen[] => {
  const swatches = swatchesOf(repositories);
  return repositories.map((repository, index) => {
    const url = `https://github.com/${repository.nameWithOwner}`;
    const language = languageOf(repository);
    const [owner = ""] = repository.nameWithOwner.split("/");
    const languageCode = languageCodeOf(language);
    return {
      description: repository.description,
      file: fileOf(
        repository,
        url,
        fileCode(section, index, repositories.length)
      ),
      forks: repository.forks,
      id: repository.nameWithOwner,
      index,
      language,
      languageCode,
      name: repository.name,
      owner,
      pushed: formatDay(repository.pushedAt),
      pushedOn: repository.pushedAt,
      spoken: `${repository.nameWithOwner}, ${language}, ${plural(repository.stars, "star", "stars")}, ${plural(repository.forks, "fork", "forks")}`,
      stars: repository.stars,
      swatch: swatches.get(language) ?? "hollow",
      topics: repository.topics.slice(0, VISIBLE_TOPICS),
      topicsLeft: Math.max(0, repository.topics.length - VISIBLE_TOPICS),
      url,
      visibility: visibilityLabels[repository.visibility],
    };
  });
};

export const openingPickOf = (specimens: readonly RepositorySpecimen[]) =>
  specimens
    .toSorted(
      (first, second) =>
        second.stars - first.stars ||
        second.pushedOn.localeCompare(first.pushedOn)
    )
    .at(0)?.index ?? null;

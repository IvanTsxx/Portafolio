import { matchQuery } from "./match";
import type { MatchRange } from "./match";
import { searchGroupOrder } from "./types";
import type { SearchEntry, SearchGroupId } from "./types";

export interface SearchHit {
  detailRanges: readonly MatchRange[];
  entry: SearchEntry;
  score: number;
  titleRanges: readonly MatchRange[];
}

export interface SearchSection {
  group: SearchGroupId;
  hits: readonly SearchHit[];
}

const TITLE_WEIGHT = 1;
const DETAIL_WEIGHT = 0.6;
const KEYWORD_WEIGHT = 0.4;

const hitFor = (entry: SearchEntry, query: string): SearchHit | null => {
  const match = matchQuery(query, [
    { fuzzy: true, text: entry.title, weight: TITLE_WEIGHT },
    { text: entry.detail, weight: DETAIL_WEIGHT },
    { text: entry.keywords.join(" "), weight: KEYWORD_WEIGHT },
  ]);
  if (!match) {
    return null;
  }
  const [titleRanges = [], detailRanges = []] = match.ranges;
  return { detailRanges, entry, score: match.score, titleRanges };
};

const groupOrderOf = (group: SearchGroupId) => searchGroupOrder.indexOf(group);

const sectionsOf = (hits: readonly SearchHit[]): SearchSection[] =>
  searchGroupOrder.flatMap((group) => {
    const groupHits = hits.filter((hit) => hit.entry.group === group);
    return groupHits.length > 0 ? [{ group, hits: groupHits }] : [];
  });

const bestScoreOf = (section: SearchSection) =>
  Math.max(...section.hits.map((hit) => hit.score));

export const searchEntries = (
  entries: readonly SearchEntry[],
  query: string
): SearchSection[] => {
  if (query.trim().length === 0) {
    return sectionsOf(
      entries.map((entry) => ({
        detailRanges: [],
        entry,
        score: 0,
        titleRanges: [],
      }))
    );
  }
  const ranked = entries
    .flatMap((entry) => {
      const hit = hitFor(entry, query);
      return hit ? [hit] : [];
    })
    .toSorted((first, second) => second.score - first.score);
  return sectionsOf(ranked).toSorted(
    (first, second) =>
      bestScoreOf(second) - bestScoreOf(first) ||
      groupOrderOf(first.group) - groupOrderOf(second.group)
  );
};

export const countHits = (sections: readonly SearchSection[]) =>
  sections.reduce((total, section) => total + section.hits.length, 0);

export interface FacetCount {
  count: number;
  name: string;
}

export const countFacets = (
  facetLists: readonly (readonly string[])[]
): FacetCount[] => {
  const counts = new Map<string, number>();
  for (const facets of facetLists) {
    for (const name of facets) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([name, count]) => ({ count, name }))
    .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

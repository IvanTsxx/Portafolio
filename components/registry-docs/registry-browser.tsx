"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useId } from "react";
import type { ReactNode } from "react";

import { FilterBar } from "@/components/content/filter-bar";
import { useUrlFilter } from "@/components/content/use-url-filter";
import { CornerMarks } from "@/components/site/corner-marks";
import { DocumentSection } from "@/components/site/document-section";
import { chipClassName, hoverRowClassName } from "@/components/site/styles";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface RegistryEntry {
  categories: readonly { id: string; label: string }[];
  description: string;
  index: string;
  name: string;
  thumbnail: ReactNode;
  title: string;
}

export interface RegistryFilterCategory {
  count: number;
  id: string;
  label: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

const matchesQuery = (entry: RegistryEntry, query: string) => {
  const terms = query.toLowerCase().split(/\s+/u).filter(Boolean);
  const haystack = [
    entry.title,
    entry.name,
    entry.description,
    ...entry.categories.map((category) => category.label),
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
};

const useRegistryFilter = (categories: readonly RegistryFilterCategory[]) => {
  const [query, setQuery] = useUrlFilter("q");
  const [requestedCategory, setCategory] = useUrlFilter("category");
  const category = categories.some((entry) => entry.id === requestedCategory)
    ? requestedCategory
    : "";
  const clear = () => {
    setQuery("");
    setCategory("");
  };
  return { category, clear, query, setCategory, setQuery };
};

const RegistryCard = ({ entry }: { entry: RegistryEntry }) => (
  <li
    className={cn(
      "group/marks border-graphite/30 relative flex flex-col border-r border-b",
      hoverRowClassName
    )}
  >
    <CornerMarks reveal="hover" />
    <div
      aria-hidden="true"
      className="border-graphite/30 bg-popover blueprint-dots relative aspect-4/3 overflow-hidden border-b [--clay:var(--clay-deep)] [--grid-size:16px]"
      inert
    >
      {entry.thumbnail}
    </div>
    <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
      <div className="label flex items-center justify-between gap-4">
        <span className="text-mist tabular-nums">{entry.index}</span>
        <span className="text-graphite truncate">
          {entry.categories.map((category) => category.label).join(" / ")}
        </span>
      </div>
      <h3 className="text-ink text-xl font-light tracking-tight">
        <Link
          className="outline-none after:absolute after:inset-0"
          href={`/registry/${entry.name}`}
        >
          {entry.title}
        </Link>
      </h3>
      <p className="text-graphite line-clamp-2 text-sm text-pretty">
        {entry.description}
      </p>
    </div>
  </li>
);

export const RegistryFilters = ({
  categories,
  total,
}: {
  categories: readonly RegistryFilterCategory[];
  total: number;
}) => {
  const { category, query, setCategory, setQuery } =
    useRegistryFilter(categories);
  const searchId = useId();

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <label className="label text-mist" htmlFor={searchId}>
          Search <span className="jp ml-1">検索</span>
        </label>
        <div className="relative w-full">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="text-graphite pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            autoComplete="off"
            className="border-graphite/60 focus-visible:border-ink focus-visible:ring-ink/50 h-11 pl-9 text-base md:text-sm"
            id={searchId}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Grid, button, scramble"
            spellCheck={false}
            type="search"
            value={query}
          />
        </div>
      </div>
      <FilterBar
        active={category}
        facets={categories.map(({ count, id, label }) => ({
          count,
          label,
          name: id,
        }))}
        jp="分類"
        label="Category"
        onChange={setCategory}
        total={total}
      />
    </div>
  );
};

export const RegistryGrid = ({
  categories,
  entries,
}: {
  categories: readonly RegistryFilterCategory[];
  entries: readonly RegistryEntry[];
}) => {
  const { category, clear, query } = useRegistryFilter(categories);
  const visibleEntries = entries.filter(
    (entry) =>
      (category === "" ||
        entry.categories.some(
          (entryCategory) => entryCategory.id === category
        )) &&
      matchesQuery(entry, query)
  );

  return (
    <DocumentSection
      aside={`${pad(visibleEntries.length)} / ${pad(entries.length)}`}
      id="components"
      index="REG-04"
      jp="部品"
      label="Components"
      waypoint={{ action: "carry", role: "builder", side: "right" }}
    >
      <output aria-live="polite" className="sr-only">
        {visibleEntries.length} of {entries.length} items
      </output>
      {visibleEntries.length > 0 ? (
        <ul className="border-graphite/30 grid border-t border-l sm:grid-cols-2">
          {visibleEntries.map((entry) => (
            <RegistryCard entry={entry} key={entry.name} />
          ))}
        </ul>
      ) : (
        <Empty className="border-rule-strong border py-16">
          <EmptyHeader>
            <EmptyTitle className="label text-ink">No match</EmptyTitle>
            <EmptyDescription className="label text-graphite">
              Nothing fits that search and category.
            </EmptyDescription>
          </EmptyHeader>
          <button
            className={cn(chipClassName, "justify-center")}
            onClick={clear}
            type="button"
          >
            Clear filters
          </button>
        </Empty>
      )}
    </DocumentSection>
  );
};

"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useId } from "react";
import type { ReactNode } from "react";

import { FilterBar } from "@/components/content/filter-bar";
import { useUrlFilter } from "@/components/content/use-url-filter";
import { DocumentSection } from "@/components/site/document-section";
import { chipClassName, focusRingClassName } from "@/components/site/styles";
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
  <li className="group/card reveal-on-view relative flex flex-col gap-4">
    <div
      aria-hidden="true"
      className="bg-surface relative grid aspect-4/3 place-items-center overflow-hidden rounded-sm grayscale"
      inert
    >
      <div className="ease-out-expo grid size-full place-items-center transition-transform duration-500 pointer-fine:group-hover/card:scale-103">
        {entry.thumbnail}
      </div>
    </div>
    <div className="flex flex-1 flex-col gap-2">
      <div className="label flex items-center justify-between gap-4">
        <span className="text-faint tabular-nums">{entry.index}</span>
        <span className="text-muted-foreground truncate">
          {entry.categories.map((category) => category.label).join(" / ")}
        </span>
      </div>
      <h3 className="display text-foreground text-xl">
        <Link
          className={cn(
            "ink-underline outline-none after:absolute after:inset-0",
            focusRingClassName
          )}
          href={`/registry/${entry.name}`}
        >
          {entry.title}
        </Link>
      </h3>
      <p className="text-muted-foreground line-clamp-2 text-sm text-pretty">
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <label className="label text-faint" htmlFor={searchId}>
          Search
        </label>
        <div className="relative w-full">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            autoComplete="off"
            className="border-border focus-visible:border-border-strong focus-visible:ring-focus/40 rounded-pill h-10 pl-9 text-base md:text-sm"
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
      index="01"
      label="Components"
    >
      <output aria-live="polite" className="sr-only">
        {visibleEntries.length} of {entries.length} items
      </output>
      {visibleEntries.length > 0 ? (
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
          {visibleEntries.map((entry) => (
            <RegistryCard entry={entry} key={entry.name} />
          ))}
        </ul>
      ) : (
        <Empty className="border-border-strong border py-16">
          <EmptyHeader>
            <EmptyTitle className="label text-foreground">No match</EmptyTitle>
            <EmptyDescription className="label text-muted-foreground">
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

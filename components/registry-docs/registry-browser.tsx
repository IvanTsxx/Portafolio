"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import { choiceItemClassName } from "@/components/registry-docs/toggle-styles";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

const allCategoriesId = "all";

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

const RegistryCard = ({ entry }: { entry: RegistryEntry }) => (
  <li className="group border-rule bg-card hover:border-rule-strong focus-within:border-rule-strong relative flex flex-col border transition-colors">
    <div
      aria-hidden="true"
      className="border-rule bg-background blueprint-dots relative aspect-4/3 overflow-hidden border-b"
      inert
    >
      {entry.thumbnail}
    </div>
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="label flex items-center justify-between gap-4">
        <span className="text-muted-foreground group-hover:text-clay transition-colors">
          {entry.index}
        </span>
        <span className="text-muted-foreground truncate">
          {entry.categories.map((category) => category.label).join(" / ")}
        </span>
      </div>
      <h3 className="text-base font-medium tracking-tight">
        <Link
          className="after:absolute after:inset-0 focus-visible:outline-offset-4"
          href={`/registry/${entry.name}`}
        >
          {entry.title}
        </Link>
      </h3>
      <p className="text-muted-foreground line-clamp-3 text-sm text-pretty">
        {entry.description}
      </p>
    </div>
  </li>
);

export const RegistryBrowser = ({
  categories,
  entries,
}: {
  categories: readonly RegistryFilterCategory[];
  entries: readonly RegistryEntry[];
}) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(allCategoriesId);
  const searchId = useId();

  const visibleEntries = entries.filter(
    (entry) =>
      (activeCategory === allCategoriesId ||
        entry.categories.some((category) => category.id === activeCategory)) &&
      matchesQuery(entry, query)
  );

  const resetFilters = () => {
    setQuery("");
    setActiveCategory(allCategoriesId);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <label className="label text-muted-foreground" htmlFor={searchId}>
            Search components
          </label>
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              autoComplete="off"
              className="h-11 pl-9 text-base md:text-sm"
              id={searchId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Grid, button, scramble"
              spellCheck={false}
              type="search"
              value={query}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span
            className="label text-muted-foreground"
            id={`${searchId}-filter`}
          >
            Category
          </span>
          <ToggleGroup
            aria-labelledby={`${searchId}-filter`}
            className="flex-wrap"
            onValueChange={(next) =>
              setActiveCategory(next[0] ?? allCategoriesId)
            }
            size="lg"
            spacing={1}
            value={[activeCategory]}
            variant="outline"
          >
            <ToggleGroupItem
              className={choiceItemClassName}
              value={allCategoriesId}
            >
              All
              <span className="text-muted-foreground tabular-nums">
                {entries.length}
              </span>
            </ToggleGroupItem>
            {categories.map((category) => (
              <ToggleGroupItem
                className={choiceItemClassName}
                key={category.id}
                value={category.id}
              >
                {category.label}
                <span className="text-muted-foreground tabular-nums">
                  {category.count}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <output aria-live="polite" className="label text-muted-foreground">
        {visibleEntries.length} of {entries.length} items
      </output>
      {visibleEntries.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleEntries.map((entry) => (
            <RegistryCard entry={entry} key={entry.name} />
          ))}
        </ul>
      ) : (
        <Empty className="border py-16">
          <EmptyHeader>
            <EmptyTitle>No components match</EmptyTitle>
            <EmptyDescription>
              Nothing in the registry matches that search and category.
            </EmptyDescription>
          </EmptyHeader>
          <button
            className="label border-rule-strong hover:border-clay hover:text-clay inline-flex min-h-11 items-center border px-4 transition-colors"
            onClick={resetFilters}
            type="button"
          >
            Clear filters
          </button>
        </Empty>
      )}
    </div>
  );
};

"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { PanelHeading } from "@/components/site/panel-heading";
import { chipClassName, hoverRowClassName } from "@/components/site/styles";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

const allCategoriesId = "all";

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
    <div className="flex flex-col gap-6">
      <PanelHeading
        aside={`${pad(visibleEntries.length)} / ${pad(entries.length)}`}
        as="h2"
        index="REG-01"
        jp="部品"
        label="Components"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <label className="label text-mist" htmlFor={searchId}>
            Search
          </label>
          <div className="relative w-full md:w-80">
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
        <div className="flex flex-col gap-3">
          <span className="label text-mist" id={`${searchId}-filter`}>
            Category
          </span>
          <ToggleGroup
            aria-labelledby={`${searchId}-filter`}
            className="flex-wrap"
            onValueChange={(next) =>
              setActiveCategory(next[0] ?? allCategoriesId)
            }
            spacing={2}
            value={[activeCategory]}
            variant="outline"
          >
            <ToggleGroupItem className={chipClassName} value={allCategoriesId}>
              All <span className="tabular-nums">{pad(entries.length)}</span>
            </ToggleGroupItem>
            {categories.map((category) => (
              <ToggleGroupItem
                className={chipClassName}
                key={category.id}
                value={category.id}
              >
                {category.label}
                <span className="tabular-nums">{pad(category.count)}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <output aria-live="polite" className="sr-only">
        {visibleEntries.length} of {entries.length} items
      </output>
      {visibleEntries.length > 0 ? (
        <ul className="border-graphite/30 mt-4 grid border-t border-l sm:grid-cols-2 xl:grid-cols-3">
          {visibleEntries.map((entry) => (
            <RegistryCard entry={entry} key={entry.name} />
          ))}
        </ul>
      ) : (
        <Empty className="border-rule-strong py-16">
          <EmptyHeader>
            <EmptyTitle className="label text-ink">No match</EmptyTitle>
            <EmptyDescription className="label text-graphite">
              Nothing fits that search and category.
            </EmptyDescription>
          </EmptyHeader>
          <button
            className={cn(chipClassName, "justify-center")}
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

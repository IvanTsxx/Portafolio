"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  ArrowElbowDownLeftIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { HighlightedText } from "@/components/command/highlighted-text";
import { PanelHeading } from "@/components/site/panel-heading";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { countHits, searchEntries } from "@/lib/search/search";
import type { SearchHit } from "@/lib/search/search";
import { searchGroups } from "@/lib/search/types";
import type {
  SearchAction,
  SearchEntry,
  SearchGroupId,
} from "@/lib/search/types";
import { cn } from "@/lib/utils";

const COPY_FEEDBACK_MS = 700;

interface CopyFeedback {
  entryId: string;
  status: "copied" | "failed";
}

const actionMarks = {
  copy: { Icon: CopyIcon, resting: true },
  external: { Icon: ArrowUpRightIcon, resting: true },
  route: { Icon: ArrowElbowDownLeftIcon, resting: false },
} as const satisfies Record<
  SearchAction["type"],
  { Icon: Icon; resting: boolean }
>;

const copyFeedbackLabels = {
  copied: "Copied",
  failed: "Copy failed",
} as const satisfies Record<CopyFeedback["status"], string>;

const GroupHeading = ({
  count,
  group,
}: {
  count: number;
  group: SearchGroupId;
}) => (
  <span className="label text-mist flex items-baseline gap-3">
    <span className="text-ink">{searchGroups[group].label}</span>
    <span
      aria-hidden
      className="border-rule-strong mb-1 h-px min-w-4 flex-1 border-b border-dotted"
    />
    <span className="text-graphite tabular-nums">
      {String(count).padStart(2, "0")}
    </span>
  </span>
);

const PaletteRow = ({
  feedback,
  hit,
  onSelect,
}: {
  feedback: CopyFeedback | null;
  hit: SearchHit;
  onSelect: (entry: SearchEntry) => void;
}) => {
  const { entry } = hit;
  const { Icon, resting } = actionMarks[entry.action.type];
  const rowFeedback = feedback?.entryId === entry.id ? feedback : null;
  return (
    <CommandItem
      className="min-h-11 gap-3 px-3 py-2 text-sm md:min-h-10"
      onSelect={() => onSelect(entry)}
      value={entry.id}
    >
      <span className="label text-mist w-12 shrink-0 tabular-nums">
        {entry.code}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
        <span className="text-ink min-w-0 truncate">
          {rowFeedback ? (
            copyFeedbackLabels[rowFeedback.status]
          ) : (
            <HighlightedText ranges={hit.titleRanges} text={entry.title} />
          )}
        </span>
        <span
          aria-hidden
          className="border-rule-strong mb-1 hidden h-px min-w-4 flex-1 self-end border-b border-dotted sm:block"
        />
        <span className="label text-mist min-w-0 shrink-3 truncate normal-case sm:max-w-2/5">
          <HighlightedText ranges={hit.detailRanges} text={entry.detail} />
        </span>
      </span>
      <CommandShortcut
        className={cn(
          "ml-0 flex size-4 shrink-0 items-center justify-center",
          !resting && "opacity-0 group-data-selected/command-item:opacity-100"
        )}
      >
        {rowFeedback?.status === "copied" ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <Icon aria-hidden className="size-4" />
        )}
      </CommandShortcut>
    </CommandItem>
  );
};

const KeyHint = ({ keys, label }: { keys: string; label: string }) => (
  <span className="flex items-center gap-2">
    <Kbd className="label bg-paper-deep text-graphite h-5 px-1.5 normal-case">
      {keys}
    </Kbd>
    {label}
  </span>
);

export const CommandPalette = ({
  entries,
  onOpenChange,
  open,
}: {
  entries: readonly SearchEntry[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null);
  const sections = searchEntries(entries, query);
  const hitCount = countHits(sections);
  const hasQuery = query.trim().length > 0;

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setSelectedId(
      searchEntries(entries, nextQuery)[0]?.hits[0]?.entry.id ?? ""
    );
  };

  const handleOpenChangeComplete = (isOpen: boolean) => {
    if (!isOpen) {
      setQuery("");
      setSelectedId("");
      setFeedback(null);
    }
  };

  const copyValue = async (entryId: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback({ entryId, status: "copied" });
    } catch {
      setFeedback({ entryId, status: "failed" });
    }
    window.setTimeout(() => onOpenChange(false), COPY_FEEDBACK_MS);
  };

  const handleSelect = (entry: SearchEntry) => {
    const { action } = entry;
    if (action.type === "copy") {
      copyValue(entry.id, action.value);
      return;
    }
    onOpenChange(false);
    if (action.type === "external") {
      window.open(action.href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(action.href);
  };

  return (
    <CommandDialog
      className="ring-rule-strong top-[12svh] sm:max-w-2xl"
      description="Search pages, sections, notes, experiments, registry items and channels."
      onOpenChange={onOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      open={open}
      title="Search"
    >
      <Command
        label="Search results"
        loop
        onValueChange={setSelectedId}
        shouldFilter={false}
        value={selectedId}
      >
        <div className="px-3 pt-3 pb-2">
          <PanelHeading aside="Esc" as="p" label="Search" />
        </div>
        <CommandInput
          className="text-base md:text-sm"
          onValueChange={handleQueryChange}
          placeholder="Pages, notes, experiments, registry, tags"
          value={query}
        />
        <CommandList className="max-h-80">
          {sections.map((section) => (
            <CommandGroup
              className="border-rule not-first:border-t **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:pt-3 **:[[cmdk-group-heading]]:pb-1.5"
              heading={
                <GroupHeading
                  count={section.hits.length}
                  group={section.group}
                />
              }
              key={section.group}
            >
              {section.hits.map((hit) => (
                <PaletteRow
                  feedback={feedback}
                  hit={hit}
                  key={hit.entry.id}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>
          ))}
          <CommandEmpty className="flex flex-col items-center gap-2 px-6 py-10">
            <span className="label text-mist">No match</span>
            <span className="text-graphite max-w-full text-sm text-pretty break-words">
              Nothing for “{query.trim()}”. Try a note title, a section or a
              tag.
            </span>
          </CommandEmpty>
        </CommandList>
        <div className="label border-rule-strong text-mist flex items-center justify-between gap-4 border-t px-3 py-2">
          {hitCount > 0 ? (
            <span className="hidden items-center gap-4 sm:flex">
              <KeyHint keys="↑↓" label="Move" />
              <KeyHint keys="↵" label="Open" />
            </span>
          ) : null}
          <span
            aria-live="polite"
            className="text-graphite tabular-nums sm:ml-auto"
          >
            {hasQuery
              ? `${hitCount} ${hitCount === 1 ? "result" : "results"}`
              : `${hitCount} entries`}
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
};

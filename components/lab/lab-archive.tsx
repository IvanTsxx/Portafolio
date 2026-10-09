"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { parseTopicParam, topicParam } from "@/lib/lab/topics";
import type { LabTopic } from "@/lib/lab/topics";
import { cn } from "@/lib/utils";

export interface ArchiveItem {
  slug: string;
  topics: readonly LabTopic[];
  card: ReactNode;
}

export interface TopicCount {
  topic: LabTopic;
  count: number;
}

const allValue = "all";

const pushTopic = (topic: LabTopic | null) => {
  const url = topic ? `?topic=${topicParam(topic)}` : window.location.pathname;
  window.history.pushState(null, "", url);
};

const spanPattern = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
] as const;

const spanFor = (itemIndex: number, itemCount: number) =>
  itemCount % 2 === 1 && itemIndex === itemCount - 1
    ? "lg:col-span-12"
    : spanPattern[itemIndex % spanPattern.length];

interface ArchiveViewProps {
  items: readonly ArchiveItem[];
  topics: readonly TopicCount[];
  selected: LabTopic | null;
  onSelect?: (topic: LabTopic | null) => void;
}

const ArchiveView = ({
  items,
  topics,
  selected,
  onSelect,
}: ArchiveViewProps) => {
  const visible = selected
    ? items.filter((item) => item.topics.includes(selected))
    : items;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ToggleGroup
          aria-label="Filter experiments by topic"
          className="flex-wrap"
          disabled={!onSelect}
          onValueChange={(next) => onSelect?.(parseTopicParam(next[0] ?? null))}
          spacing={1}
          value={[selected ? topicParam(selected) : allValue]}
          variant="outline"
        >
          <ToggleGroupItem
            className="label aria-pressed:bg-foreground aria-pressed:text-background"
            value={allValue}
          >
            All <span className="tabular-nums opacity-60">{items.length}</span>
          </ToggleGroupItem>
          {topics.map(({ topic, count }) => (
            <ToggleGroupItem
              className="label aria-pressed:bg-foreground aria-pressed:text-background"
              key={topic}
              value={topicParam(topic)}
            >
              {topic} <span className="tabular-nums opacity-60">{count}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p aria-live="polite" className="label text-faint tabular-nums">
          {visible.length} of {items.length} experiments
          {selected ? ` · ${selected}` : ""}
        </p>
      </div>
      <ul className="bg-rule border-rule grid gap-px border lg:grid-cols-12">
        {visible.map((item, itemIndex) => (
          <li
            className={cn("min-w-0", spanFor(itemIndex, visible.length))}
            key={item.slug}
          >
            {item.card}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const LabArchiveFallback = (
  props: Omit<ArchiveViewProps, "selected" | "onSelect">
) => <ArchiveView {...props} selected={null} />;

export const LabArchive = (
  props: Omit<ArchiveViewProps, "selected" | "onSelect">
) => {
  const searchParams = useSearchParams();
  const selected = parseTopicParam(searchParams.get("topic"));

  return <ArchiveView {...props} onSelect={pushTopic} selected={selected} />;
};

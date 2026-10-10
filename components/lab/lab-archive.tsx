"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { PanelHeading } from "@/components/site/panel-heading";
import { chipClassName } from "@/components/site/styles";
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

const pad = (value: number) => String(value).padStart(2, "0");

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
    <section
      aria-label="Experiments"
      className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 pb-8 md:px-8"
    >
      <PanelHeading
        aside={`${pad(visible.length)} / ${pad(items.length)}`}
        as="h2"
        index="LAB-01"
        jp="一覧"
        label="Index"
      />
      <ToggleGroup
        aria-label="Filter experiments by topic"
        className="flex-wrap"
        disabled={!onSelect}
        onValueChange={(next) => onSelect?.(parseTopicParam(next[0] ?? null))}
        spacing={2}
        value={[selected ? topicParam(selected) : allValue]}
        variant="outline"
      >
        <ToggleGroupItem className={chipClassName} value={allValue}>
          All <span className="tabular-nums">{pad(items.length)}</span>
        </ToggleGroupItem>
        {topics.map(({ topic, count }) => (
          <ToggleGroupItem
            className={chipClassName}
            key={topic}
            value={topicParam(topic)}
          >
            {topic} <span className="tabular-nums">{pad(count)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ul className="border-graphite/30 grid border-t border-l lg:grid-cols-12">
        {visible.map((item, itemIndex) => (
          <li
            className={cn(
              "border-graphite/30 min-w-0 border-r border-b",
              spanFor(itemIndex, visible.length)
            )}
            key={item.slug}
          >
            {item.card}
          </li>
        ))}
      </ul>
    </section>
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

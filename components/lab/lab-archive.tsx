"use client";

import type { ReactNode } from "react";

import { FilterBar } from "@/components/content/filter-bar";
import { useUrlFilter } from "@/components/content/use-url-filter";
import { DocumentSection } from "@/components/site/document-section";
import { parseTopicParam, topicParam } from "@/lib/lab/topics";
import type { LabTopic } from "@/lib/lab/topics";
import { sectionScripts } from "@/lib/site/section-scripts";
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

const pad = (value: number) => String(value).padStart(2, "0");

const useLabTopic = () => {
  const [param, setParam] = useUrlFilter("topic");
  const selectTopic = (name: string) => {
    const topic = parseTopicParam(name.toLowerCase());
    setParam(topic ? topicParam(topic) : "");
  };
  return [parseTopicParam(param), selectTopic] as const;
};

export const LabTopicFilter = ({
  topics,
  total,
}: {
  topics: readonly TopicCount[];
  total: number;
}) => {
  const [selected, selectTopic] = useLabTopic();
  return (
    <FilterBar
      active={selected ?? ""}
      facets={topics.map(({ count, topic }) => ({ count, name: topic }))}
      jp="分野"
      label="Topic"
      onChange={selectTopic}
      total={total}
    />
  );
};

export const LabArchive = ({ items }: { items: readonly ArchiveItem[] }) => {
  const [selected] = useLabTopic();
  const visible = selected
    ? items.filter((item) => item.topics.includes(selected))
    : items;

  return (
    <DocumentSection
      aside={`${pad(visible.length)} / ${pad(items.length)}`}
      id="experiments"
      index="LAB-03"
      jp="一覧"
      label="Index"
      script={sectionScripts.labExperiments}
    >
      <output aria-live="polite" className="sr-only">
        Showing {visible.length} of {items.length}
      </output>
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
    </DocumentSection>
  );
};

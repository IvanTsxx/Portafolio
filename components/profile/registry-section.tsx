import Link from "next/link";
import type { ComponentType } from "react";

import { ItemStyles } from "@/components/registry-docs/item-styles";
import { loadDemoModule } from "@/components/registry-docs/load-demo";
import { CornerMarks } from "@/components/site/corner-marks";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { focusRingClassName } from "@/components/site/styles";
import { formatRegistryIndex, registryItems } from "@/lib/registry/registry";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";
import { registryItemPath } from "@/lib/site/seo";
import { cn } from "@/lib/utils";

interface RegistryShelfEntry {
  description: string;
  index: string;
  name: string;
  Thumbnail: ComponentType;
  title: string;
}

const cellClassName = cn(
  "group/ink group/marks relative flex flex-col",
  focusRingClassName
);

const RegistryCell = ({ entry }: { entry: RegistryShelfEntry }) => {
  const { Thumbnail } = entry;
  return (
    <li className="border-rule min-w-0 border-r border-b" data-build-block>
      <Link className={cellClassName} href={registryItemPath(entry.name)}>
        <CornerMarks reveal="hover" />
        <div
          aria-hidden="true"
          className="bg-popover border-rule blueprint-dots relative aspect-video overflow-hidden border-b [--clay:var(--clay-deep)] [--grid-size:16px]"
          inert
        >
          <Thumbnail />
        </div>
        <div className="flex flex-col gap-1 p-3">
          <span className="label text-mist tabular-nums">{entry.index}</span>
          <span className="text-ink truncate text-sm">
            <span className="ink-underline">{entry.title}</span>
          </span>
          <span className="text-graphite truncate text-xs">
            {entry.description}
          </span>
        </div>
      </Link>
    </li>
  );
};

export const RegistrySection = async () => {
  const entries = await Promise.all(
    registryItems.map(async (item, position) => {
      const { Thumbnail } = await loadDemoModule(item.name);
      return {
        Thumbnail,
        description: item.description,
        index: formatRegistryIndex(position),
        name: item.name,
        title: item.title,
      };
    })
  );

  const section = homeSectionById("registry");
  return (
    <DocumentSection
      aside={<PanelCount current={entries.length} total={entries.length} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeRegistry}
    >
      <ItemStyles items={registryItems} />
      <ul className="border-rule grid grid-cols-2 border-t border-l sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => (
          <RegistryCell entry={entry} key={entry.name} />
        ))}
        <li className="border-rule border-r border-b" data-build-block>
          <Link
            className={cn(
              cellClassName,
              "label text-ink h-full min-h-32 justify-end p-3"
            )}
            href="/registry"
          >
            <CornerMarks reveal="hover" />
            <span>
              <span className="ink-underline">All components</span> →
            </span>
          </Link>
        </li>
      </ul>
    </DocumentSection>
  );
};

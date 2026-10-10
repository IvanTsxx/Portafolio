import type { ReactNode } from "react";

import { PanelHeading } from "@/components/site/panel-heading";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export interface DocsSectionLink {
  id: string;
  label: string;
}

export const DocsSection = ({
  children,
  id,
  index,
  jp,
  title,
}: {
  children: ReactNode;
  id: string;
  index: string;
  jp: string;
  title: string;
}) => (
  <section
    aria-labelledby={`${id}-title`}
    className="flex scroll-mt-20 flex-col gap-6"
    id={id}
  >
    <PanelHeading
      as="h2"
      id={`${id}-title`}
      index={index}
      jp={jp}
      label={title}
    />
    {children}
  </section>
);

export const SectionNav = ({
  sections,
}: {
  sections: readonly DocsSectionLink[];
}) => (
  <nav aria-label="On this page" className="flex flex-col gap-4">
    <p className="label text-mist">
      On this page <span className="jp ml-2">目次</span>
    </p>
    <ol className="border-rule flex flex-col border-l">
      {sections.map((section, position) => (
        <li key={section.id}>
          <a
            className={cn(
              "label text-graphite hover:text-ink hover:border-ink ease-mechanical -ml-px flex min-h-9 items-center gap-3 border-l border-transparent px-3 transition-colors duration-100",
              focusRingClassName
            )}
            href={`#${section.id}`}
          >
            <span className="text-mist tabular-nums">
              {String(position + 1).padStart(2, "0")}
            </span>
            {section.label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

export const BulletList = ({ items }: { items: readonly string[] }) => (
  <ul className="flex max-w-prose flex-col">
    {items.map((item) => (
      <li
        className="border-rule flex gap-4 border-b border-dotted py-3 text-sm text-pretty"
        key={item}
      >
        <span aria-hidden="true" className="bg-ink mt-1.5 size-1.5 shrink-0" />
        <span className="text-graphite">{item}</span>
      </li>
    ))}
  </ul>
);

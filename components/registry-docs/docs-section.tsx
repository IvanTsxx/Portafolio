import type { ReactNode } from "react";

export interface DocsSectionLink {
  id: string;
  label: string;
}

export const DocsSection = ({
  children,
  id,
  index,
  title,
}: {
  children: ReactNode;
  id: string;
  index: string;
  title: string;
}) => (
  <section
    aria-labelledby={`${id}-title`}
    className="border-rule flex scroll-mt-20 flex-col gap-6 border-t pt-8"
    id={id}
  >
    <div className="flex items-baseline gap-4">
      <span className="label text-muted-foreground tabular-nums">{index}</span>
      <h2 className="text-xl font-medium tracking-tight" id={`${id}-title`}>
        {title}
      </h2>
    </div>
    {children}
  </section>
);

export const SectionNav = ({
  sections,
}: {
  sections: readonly DocsSectionLink[];
}) => (
  <nav aria-label="On this page" className="flex flex-col gap-4">
    <p className="label text-muted-foreground">On this page</p>
    <ol className="border-rule flex flex-col border-l">
      {sections.map((section, position) => (
        <li key={section.id}>
          <a
            className="label text-muted-foreground hover:text-foreground hover:border-clay focus-visible:text-foreground -ml-px flex min-h-9 items-center gap-3 border-l border-transparent px-3 transition-colors"
            href={`#${section.id}`}
          >
            <span className="tabular-nums">
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
  <ul className="flex max-w-prose flex-col gap-3">
    {items.map((item) => (
      <li className="flex gap-4 text-sm text-pretty" key={item}>
        <span aria-hidden="true" className="bg-clay mt-2 size-1.5 shrink-0" />
        <span className="text-muted-foreground">{item}</span>
      </li>
    ))}
  </ul>
);

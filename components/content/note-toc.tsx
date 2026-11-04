"use client";

import { Popover } from "@base-ui/react/popover";
import { CaretUpIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { focusRingClassName } from "@/components/site/styles";
import type { Heading } from "@/lib/content/text";
import { cn } from "@/lib/utils";

interface TocEntry {
  id: string;
  text: string;
}

interface IndicatorBox {
  height: number;
  top: number;
}

type TocVariant = "plate" | "sheet";

const readingLineRatio = 0.3;

const footerClearance = "0px 0px -20% 0px";

const pad = (value: number) => String(value).padStart(2, "0");

const tocRowVariants = cva(
  `group/row text-muted-foreground hover:text-foreground aria-[current=location]:text-foreground ease-mechanical flex items-baseline gap-3 pl-4 transition-colors duration-150 ${focusRingClassName}`,
  {
    variants: {
      variant: {
        plate: "min-h-8 py-1.5 text-sm",
        sheet: "min-h-11 items-center py-2 text-sm",
      },
    },
  }
);

const useActiveSection = (ids: readonly string[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = ids.join(" ");

  useEffect(() => {
    const headings = idsKey
      .split(" ")
      .filter(Boolean)
      .map((id) => document.querySelector<HTMLElement>(`#${CSS.escape(id)}`))
      .filter((heading) => heading !== null);
    let frame = 0;
    const update = () => {
      frame = 0;
      const readingLine = window.innerHeight * readingLineRatio;
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      const current = isAtBottom
        ? headings.at(-1)
        : headings.findLast(
            (heading) => heading.getBoundingClientRect().top <= readingLine
          );
      setActiveId(current?.id ?? null);
    };
    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [idsKey]);

  return [activeId, setActiveId] as const;
};

const useDockVisibility = (anchor: RefObject<HTMLElement | null>) => {
  const [isPastAnchor, setIsPastAnchor] = useState(false);
  const [isFooterInView, setIsFooterInView] = useState(false);

  useEffect(() => {
    const element = anchor.current;
    const footer = document.querySelector("footer");
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.target === footer) {
            setIsFooterInView(record.isIntersecting);
          } else {
            setIsPastAnchor(
              !record.isIntersecting && record.boundingClientRect.top < 0
            );
          }
        }
      },
      { rootMargin: footerClearance }
    );
    if (element) {
      observer.observe(element);
    }
    if (footer) {
      observer.observe(footer);
    }
    return () => observer.disconnect();
  }, [anchor]);

  return isPastAnchor && !isFooterInView;
};

const useIndicator = (activeId: string | null) => {
  const track = useRef<HTMLOListElement>(null);
  const [box, setBox] = useState<IndicatorBox | null>(null);

  useEffect(() => {
    const element = track.current;
    if (!element) {
      return;
    }
    const measure = () => {
      const active = activeId
        ? element.querySelector<HTMLElement>(
            `[data-toc-id="${CSS.escape(activeId)}"]`
          )
        : null;
      setBox(
        active ? { height: active.offsetHeight, top: active.offsetTop } : null
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [activeId]);

  return { box, track };
};

const TocList = ({
  activeId,
  activeRef,
  entries,
  onNavigate,
  variant,
}: {
  activeId: string | null;
  activeRef?: RefObject<HTMLAnchorElement | null>;
  entries: readonly TocEntry[];
  onNavigate: (id: string) => void;
  variant: TocVariant;
}) => {
  const { box, track } = useIndicator(activeId);

  return (
    <ol className="border-border relative flex flex-col border-l" ref={track}>
      <span
        aria-hidden
        className="bg-border-strong reading-progress-y pointer-events-none absolute inset-y-0 -left-px w-px"
      />
      <span
        aria-hidden
        className={cn(
          "bg-signal ease-out-expo pointer-events-none absolute top-0 -left-px h-px w-px origin-top transition-[translate,scale,opacity] duration-300",
          box ? "opacity-100" : "opacity-0"
        )}
        style={{
          scale: `1 ${box?.height ?? 0}`,
          translate: `0 ${box?.top ?? 0}px`,
        }}
      />
      {entries.map((entry, index) => {
        const isActive = activeId === entry.id;
        return (
          <li key={entry.id}>
            <a
              aria-current={isActive ? "location" : undefined}
              className={tocRowVariants({ variant })}
              data-toc-id={entry.id}
              href={`#${entry.id}`}
              onClick={() => onNavigate(entry.id)}
              ref={isActive ? activeRef : undefined}
            >
              <span className="label text-faint group-hover/row:text-muted-foreground group-aria-[current=location]/row:text-signal shrink-0 tracking-normal tabular-nums transition-colors duration-150">
                {pad(index + 1)}
              </span>
              <span className="min-w-0 text-pretty">{entry.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
};

const Readout = ({
  activeIndex,
  total,
}: {
  activeIndex: number;
  total: number;
}) => (
  <span className="label text-faint shrink-0 tracking-normal whitespace-nowrap tabular-nums">
    <span className="text-foreground">
      {activeIndex < 0 ? "--" : pad(activeIndex + 1)}
    </span>
    {` / ${pad(total)}`}
  </span>
);

const TocDock = ({
  activeId,
  entries,
  isVisible,
  onNavigate,
}: {
  activeId: string | null;
  entries: readonly TocEntry[];
  isVisible: boolean;
  onNavigate: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const activeIndex = entries.findIndex((entry) => entry.id === activeId);
  const current = entries[activeIndex] ?? entries[0];

  if (!isVisible && isOpen) {
    setIsOpen(false);
  }

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "bottom-safe pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 lg:hidden",
        "ease-out-expo transition-[translate,opacity] duration-300",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 motion-reduce:translate-y-0"
      )}
      inert={!isVisible}
    >
      <Popover.Root onOpenChange={setIsOpen} open={isOpen}>
        <Popover.Trigger
          aria-label={`On this page: ${current?.text ?? ""}`}
          className={cn(
            "border-border-strong bg-popover text-foreground rounded-pill ease-out-quart pointer-events-auto relative flex h-11 max-w-72 min-w-0 items-center gap-3 overflow-hidden border pr-3 pl-4 text-sm transition-[scale] duration-150 active:scale-97",
            focusRingClassName
          )}
        >
          <Readout activeIndex={activeIndex} total={entries.length} />
          <span className="min-w-0 truncate">{current?.text}</span>
          <CaretUpIcon
            aria-hidden
            className="text-muted-foreground ease-out-quart size-3.5 shrink-0 transition-transform duration-200 in-data-popup-open:rotate-180"
          />
          <span
            aria-hidden
            className="bg-foreground reading-progress-x pointer-events-none absolute inset-x-6 bottom-0 h-px"
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            align="center"
            className="z-50"
            collisionPadding={16}
            side="top"
            sideOffset={8}
          >
            <Popover.Popup
              className="border-border-strong bg-popover ease-out-quart flex w-72 origin-(--transform-origin) flex-col gap-3 rounded-md border p-3 transition-[opacity,scale] duration-200 outline-none data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-96 motion-safe:data-starting-style:scale-96"
              initialFocus={() => activeRef.current ?? true}
            >
              <div className="flex items-baseline justify-between gap-4">
                <Popover.Title className="label text-faint">
                  On this page
                </Popover.Title>
                <Readout activeIndex={activeIndex} total={entries.length} />
              </div>
              <nav
                aria-label="On this page"
                className="no-scrollbar max-h-80 overflow-y-auto"
              >
                <TocList
                  activeId={activeId}
                  activeRef={activeRef}
                  entries={entries}
                  onNavigate={(id) => {
                    onNavigate(id);
                    setIsOpen(false);
                  }}
                  variant="sheet"
                />
              </nav>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export const NoteToc = ({ headings }: { headings: readonly Heading[] }) => {
  const entries = headings.filter((heading) => heading.depth === 2);
  const [activeId, setActiveId] = useActiveSection(
    entries.map((entry) => entry.id)
  );
  const anchor = useRef<HTMLDivElement>(null);
  const isDockVisible = useDockVisibility(anchor);

  if (entries.length < 2) {
    return null;
  }

  const activeIndex = entries.findIndex((entry) => entry.id === activeId);

  return (
    <div ref={anchor}>
      <nav aria-label="On this page" className="hidden flex-col gap-4 lg:flex">
        <div className="flex items-baseline justify-between gap-4">
          <p className="label text-faint">On this page</p>
          <Readout activeIndex={activeIndex} total={entries.length} />
        </div>
        <TocList
          activeId={activeId}
          entries={entries}
          onNavigate={setActiveId}
          variant="plate"
        />
      </nav>
      <TocDock
        activeId={activeId}
        entries={entries}
        isVisible={isDockVisible}
        onNavigate={setActiveId}
      />
    </div>
  );
};

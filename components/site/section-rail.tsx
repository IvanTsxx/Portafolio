"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

import { setCompanionRail } from "@/components/scene/companion-rail";
import type { RailLayout } from "@/components/scene/companion-rail-math";
import {
  activeStopIndex,
  railLayout,
  railShare,
} from "@/components/scene/companion-rail-math";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export interface RailSection {
  id: string;
  index: string;
  label: string;
}

const landingOffset = 80;
const markGapPixels = 40;
const activeLeadShare = 0.3;
const userScrollEvents = ["wheel", "touchstart", "keydown"] as const;

const evenShare = (index: number, count: number) =>
  count > 1 ? index / (count - 1) : 0;

const markStyle = (share: number): CSSProperties & { "--mark": string } => ({
  "--mark": `${share * 100}%`,
});

const measureLayout = (
  sections: readonly RailSection[],
  trackLength: number
): RailLayout => {
  const { scrollY } = window;
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const sectionTops = sections.map((section) => {
    const element = document.querySelector(`[id="${CSS.escape(section.id)}"]`);
    return element
      ? element.getBoundingClientRect().top + scrollY
      : maxScroll + landingOffset;
  });
  return railLayout({
    landingOffset,
    maxScroll,
    minGap: trackLength > 0 ? markGapPixels / trackLength : 0,
    sectionTops,
  });
};

const focusSibling = (
  event: KeyboardEvent<HTMLAnchorElement>,
  links: readonly (HTMLAnchorElement | null)[]
) => {
  const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
  if (!step) {
    return;
  }
  const current = links.indexOf(
    document.activeElement instanceof HTMLAnchorElement
      ? document.activeElement
      : null
  );
  if (current === -1) {
    return;
  }
  event.preventDefault();
  const next = (current + step + links.length) % links.length;
  links[next]?.focus();
};

export const SectionRail = ({
  sections,
}: {
  sections: readonly RailSection[];
}) => {
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const carriage = useRef<HTMLSpanElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const clickedIndex = useRef<number | null>(null);
  const [marks, setMarks] = useState<readonly number[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const trackElement = track.current;
    if (!trackElement) {
      return;
    }
    let layout: RailLayout | null = null;
    let trackLength = 0;
    let frame = 0;

    const paint = () => {
      frame = 0;
      if (!layout) {
        return;
      }
      const share = railShare(window.scrollY, layout.anchors);
      fill.current?.style.setProperty("transform", `scaleY(${share})`);
      carriage.current?.style.setProperty(
        "transform",
        `translateY(${share * trackLength}px)`
      );
      setActiveIndex(
        clickedIndex.current ??
          activeStopIndex(
            window.scrollY + window.innerHeight * activeLeadShare,
            layout.stops
          )
      );
    };

    const measure = () => {
      const box = trackElement.getBoundingClientRect();
      const isRail = getComputedStyle(trackElement).position === "absolute";
      trackLength = isRail ? box.height : 0;
      layout = measureLayout(sections, trackLength);
      setMarks(layout.marks);
      setCompanionRail(
        isRail && trackLength > 0
          ? {
              anchors: layout.anchors,
              track: { bottom: box.bottom, left: box.left, top: box.top },
            }
          : null
      );
      paint();
    };

    const schedulePaint = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(paint);
      }
    };
    const releaseClick = () => {
      clickedIndex.current = null;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    observer.observe(trackElement);
    window.addEventListener("scroll", schedulePaint, { passive: true });
    window.addEventListener("scrollend", measure);
    for (const type of userScrollEvents) {
      window.addEventListener(type, releaseClick, { passive: true });
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedulePaint);
      window.removeEventListener("scrollend", measure);
      for (const type of userScrollEvents) {
        window.removeEventListener(type, releaseClick);
      }
      setCompanionRail(null);
    };
  }, [sections]);

  return (
    <nav
      aria-label="On this page"
      className="flex flex-col gap-3 lg:pointer-events-none lg:fixed lg:top-12 lg:right-0 lg:bottom-0 lg:left-[calc(50%+var(--container-column)/2)] lg:z-20"
      data-section-rail=""
    >
      <p className="label text-mist lg:hidden">
        On this page <span className="jp ml-1">目次</span>
      </p>
      <div
        className="relative lg:absolute lg:top-20 lg:bottom-12 lg:left-22 xl:left-30"
        data-rail-track=""
        ref={track}
      >
        <span
          aria-hidden
          className="bg-rule-strong/40 absolute inset-y-0 -left-1 hidden w-px lg:block"
        />
        <span
          aria-hidden
          className="bg-rule-strong/40 absolute inset-y-0 left-1 hidden w-px lg:block"
        />
        <span
          aria-hidden
          className="rail-ties absolute inset-y-0 -left-1 hidden w-2 opacity-40 lg:block"
        />
        <span
          aria-hidden
          className="bg-ink absolute inset-y-0 left-0 hidden w-px origin-top lg:block"
          style={{ transform: "scaleY(0)" }}
          ref={fill}
        />
        <span
          aria-hidden
          className="absolute top-0 -left-5 hidden h-px w-4 lg:block"
          ref={carriage}
        >
          <span className="bg-ink absolute inset-0" />
          <span className="bg-paper border-ink absolute top-1/2 -right-1.5 size-2 -translate-y-1/2 border" />
        </span>
        <ol className="flex flex-col lg:block">
          {sections.map((section, index) => {
            const isActive = activeIndex === index;
            return (
              <li
                className="lg:absolute lg:top-(--mark) lg:left-0 lg:w-max"
                key={section.id}
                style={markStyle(
                  marks?.[index] ?? evenShare(index, sections.length)
                )}
              >
                <a
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "group/mark text-graphite hover:text-ink aria-[current=location]:text-ink ease-mechanical flex min-h-11 items-center gap-3 text-sm transition-colors duration-100 lg:pointer-events-auto lg:min-h-8 lg:-translate-y-1/2 lg:gap-2 lg:pr-2 lg:whitespace-nowrap",
                    focusRingClassName
                  )}
                  href={`#${section.id}`}
                  onClick={() => {
                    clickedIndex.current = index;
                    setActiveIndex(index);
                  }}
                  onKeyDown={(event) => focusSibling(event, links.current)}
                  ref={(element) => {
                    links.current[index] = element;
                  }}
                >
                  <svg
                    aria-hidden
                    className="fill-paper stroke-ink group-aria-[current=location]/mark:fill-ink ease-mechanical h-2 w-3.5 shrink-0 transition-[fill] duration-150 lg:-ml-1.75"
                    viewBox="0 0 14 8"
                  >
                    <path d="M7 0.5 13.5 4 7 7.5 0.5 4Z" />
                  </svg>
                  <span className="label text-mist group-hover/mark:text-ink group-aria-[current=location]/mark:text-ink tabular-nums transition-colors duration-100">
                    {section.index}
                  </span>
                  <span className="lg:label lg:max-xl:sr-only">
                    {section.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

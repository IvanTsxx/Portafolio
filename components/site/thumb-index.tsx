"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

import {
  activeSpokenSection,
  pinActiveSection,
  subscribeActiveSection,
} from "@/components/scene/active-section";
import { setCompanionRail } from "@/components/scene/companion-rail";
import type { RailLayout } from "@/components/scene/companion-rail-math";
import {
  railLayout,
  railShare,
  sectionLandingOffset,
} from "@/components/scene/companion-rail-math";
import { focusRingClassName } from "@/components/site/styles";
import { notchNumber, sectionsForRoute } from "@/lib/site/page-sections";
import type { PageSection } from "@/lib/site/page-sections";
import { cn } from "@/lib/utils";

const notchGapPixels = 40;
const backCoverSelector = "[data-back-cover]";

const evenShare = (index: number, count: number) =>
  count > 1 ? index / (count - 1) : 0;

const markStyle = (share: number): CSSProperties & { "--mark": string } => ({
  "--mark": `${share * 100}%`,
});

const measureLayout = (
  sections: readonly PageSection[],
  stripLength: number
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
      : maxScroll + sectionLandingOffset;
  });
  return railLayout({
    landingOffset: sectionLandingOffset,
    maxScroll,
    minGap: stripLength > 0 ? notchGapPixels / stripLength : 0,
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
  links[(current + step + links.length) % links.length]?.focus();
};

export const ThumbIndex = ({
  sections,
}: {
  sections: readonly PageSection[];
}) => {
  const strip = useRef<HTMLElement>(null);
  const lane = useRef<HTMLSpanElement>(null);
  const edgeFill = useRef<HTMLSpanElement>(null);
  const progressFill = useRef<HTMLSpanElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const [marks, setMarks] = useState<readonly number[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isCoverInView, setIsCoverInView] = useState(false);

  useEffect(() => {
    const stripElement = strip.current;
    const laneElement = lane.current;
    if (!stripElement || !laneElement) {
      return;
    }
    let layout: RailLayout | null = null;
    let frame = 0;

    const paint = () => {
      frame = 0;
      if (!layout) {
        return;
      }
      const share = railShare(window.scrollY, layout.anchors);
      edgeFill.current?.style.setProperty("transform", `scaleY(${share})`);
      progressFill.current?.style.setProperty("transform", `scaleX(${share})`);
      const activeId =
        activeSpokenSection(window.scrollY, window.innerHeight)?.id ?? null;
      setActiveIndex(sections.findIndex((section) => section.id === activeId));
    };

    const measure = () => {
      const stripBox = stripElement.getBoundingClientRect();
      const laneBox = laneElement.getBoundingClientRect();
      const isLaneShown = getComputedStyle(laneElement).display !== "none";
      layout = measureLayout(sections, stripBox.height);
      setMarks(layout.marks);
      setCompanionRail(
        isLaneShown && laneBox.height > 0
          ? {
              ids: sections.map((section) => section.id),
              marks: layout.marks,
              track: {
                bottom: laneBox.bottom,
                left: laneBox.left,
                top: laneBox.top,
              },
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

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(stripElement);
    const coverObserver = new IntersectionObserver(([entry]) => {
      setIsCoverInView(entry?.isIntersecting ?? false);
    });
    const cover = document.querySelector(backCoverSelector);
    if (cover) {
      coverObserver.observe(cover);
    }
    const unsubscribe = subscribeActiveSection(schedulePaint);
    window.addEventListener("scroll", schedulePaint, { passive: true });
    window.addEventListener("scrollend", measure);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      coverObserver.disconnect();
      window.removeEventListener("scroll", schedulePaint);
      window.removeEventListener("scrollend", measure);
      unsubscribe();
      setCompanionRail(null);
    };
  }, [sections]);

  const shareAt = (index: number) =>
    marks?.[index] ?? evenShare(index, sections.length);

  return (
    <>
      <nav
        aria-label="On this page"
        className="ease-out-quart pointer-events-none fixed top-24 right-[calc(50%-var(--container-column)/2-3rem)] bottom-16 z-20 hidden w-12 transition-[opacity,translate,visibility] duration-300 data-[cover=true]:invisible data-[cover=true]:translate-x-2 data-[cover=true]:opacity-0 lg:block"
        data-cover={isCoverInView}
        ref={strip}
      >
        <span
          aria-hidden
          className="bg-ink absolute inset-y-0 right-0 w-px origin-top"
          ref={edgeFill}
          style={{ transform: "scaleY(0)" }}
        />
        <ol>
          {sections.map((section, index) => (
            <li
              className="absolute top-(--mark) -right-px"
              key={section.id}
              style={markStyle(shareAt(index))}
            >
              <a
                aria-current={activeIndex === index ? "location" : undefined}
                className={cn(
                  "group/notch pointer-events-auto relative flex h-8 -translate-y-1/2 items-center gap-2 pl-2",
                  focusRingClassName
                )}
                href={`#${section.id}`}
                onClick={() => {
                  pinActiveSection(section.id);
                  setActiveIndex(index);
                }}
                onKeyDown={(event) => focusSibling(event, links.current)}
                ref={(element) => {
                  links.current[index] = element;
                }}
              >
                <span className="label bg-paper text-ink ease-out-quart pointer-events-none absolute right-full mr-1 px-1.5 py-1 whitespace-nowrap opacity-0 transition-[opacity,clip-path] duration-200 [clip-path:inset(0_0_0_100%)] group-hover/notch:opacity-100 group-hover/notch:[clip-path:inset(0)] group-focus-visible/notch:opacity-100 group-focus-visible/notch:[clip-path:inset(0)]">
                  {section.label}
                </span>
                <span className="label text-mist group-hover/notch:text-ink group-aria-[current=location]/notch:text-ink ease-mechanical tabular-nums transition-colors duration-100">
                  {notchNumber(section.index)}
                </span>
                <span
                  aria-hidden
                  className="border-rule-strong/60 bg-paper-deep group-hover/notch:bg-rule group-aria-[current=location]/notch:border-ink group-aria-[current=location]/notch:bg-ink ease-out-quart h-7 w-2.5 border-y border-l transition-[background-color,border-color] duration-300"
                />
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <span
        aria-hidden
        className="pointer-events-none fixed top-24 bottom-16 left-[calc(50%+var(--container-column)/2+8.5rem)] hidden w-px lg:block xl:left-[calc(50%+var(--container-column)/2+10.5rem)]"
        ref={lane}
      />
      <div
        aria-hidden
        className="bg-paper-deep fixed inset-x-0 top-12 z-40 h-1 lg:hidden"
      >
        <span
          className="bg-ink absolute inset-0 origin-left"
          ref={progressFill}
          style={{ transform: "scaleX(0)" }}
        />
        {sections.map((section, index) => (
          <span
            className="bg-paper absolute inset-y-0 left-(--mark) w-0.5 -translate-x-1/2"
            key={section.id}
            style={markStyle(shareAt(index))}
          />
        ))}
      </div>
    </>
  );
};

export const RouteThumbIndex = () => {
  const sections = sectionsForRoute(usePathname());
  return sections.length > 1 ? <ThumbIndex sections={sections} /> : null;
};

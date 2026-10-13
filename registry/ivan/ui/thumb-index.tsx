"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ComponentProps,
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  RefObject,
} from "react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import {
  activeStopIndex,
  thumbLayout,
  thumbShare,
} from "@/registry/ivan/lib/thumb-index-layout";
import type { ThumbLayout } from "@/registry/ivan/lib/thumb-index-layout";

export interface ThumbIndexSection {
  id: string;
  label: string;
}

const notchGapPixels = 40;
const activeLeadShare = 0.3;
const userScrollEvents = ["wheel", "touchstart", "keydown"] as const;

const evenShare = (index: number, count: number) =>
  count > 1 ? index / (count - 1) : 0;

const markStyle = (share: number): CSSProperties & { "--mark": string } => ({
  "--mark": `${share * 100}%`,
});

const notchNumber = (index: number) => String(index + 1).padStart(2, "0");

interface ScrollSource {
  maxScroll: () => number;
  scrollTop: () => number;
  sectionTop: (element: Element) => number;
  target: EventTarget;
  viewport: () => number;
}

const windowSource = (): ScrollSource => ({
  maxScroll: () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  scrollTop: () => window.scrollY,
  sectionTop: (element) => element.getBoundingClientRect().top + window.scrollY,
  target: window,
  viewport: () => window.innerHeight,
});

const elementSource = (container: HTMLElement): ScrollSource => ({
  maxScroll: () => Math.max(0, container.scrollHeight - container.clientHeight),
  scrollTop: () => container.scrollTop,
  sectionTop: (element) =>
    element.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop,
  target: container,
  viewport: () => container.clientHeight,
});

const listenToScroll = (
  target: EventTarget,
  {
    onScroll,
    onScrollEnd,
    onUserScroll,
  }: { onScroll: () => void; onScrollEnd: () => void; onUserScroll: () => void }
) => {
  target.addEventListener("scroll", onScroll, { passive: true });
  target.addEventListener("scrollend", onScrollEnd);
  for (const type of userScrollEvents) {
    target.addEventListener(type, onUserScroll, { passive: true });
  }
  return () => {
    target.removeEventListener("scroll", onScroll);
    target.removeEventListener("scrollend", onScrollEnd);
    for (const type of userScrollEvents) {
      target.removeEventListener(type, onUserScroll);
    }
  };
};

const focusSibling = (
  event: KeyboardEvent<HTMLAnchorElement>,
  links: readonly (HTMLAnchorElement | null)[]
) => {
  const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
  if (!step) {
    return;
  }
  const current = links.indexOf(event.currentTarget);
  if (current === -1) {
    return;
  }
  event.preventDefault();
  links[(current + step + links.length) % links.length]?.focus();
};

export interface ThumbIndexProps extends Omit<
  ComponentProps<"nav">,
  "children"
> {
  sections: readonly ThumbIndexSection[];
  container?: RefObject<HTMLElement | null>;
  landingOffset?: number;
}

export const ThumbIndex = ({
  sections,
  container,
  landingOffset = 80,
  className,
  "aria-label": ariaLabel = "On this page",
  ...props
}: ThumbIndexProps) => {
  const strip = useRef<HTMLElement>(null);
  const edgeFill = useRef<HTMLSpanElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const clickedIndex = useRef<number | null>(null);
  const layoutRef = useRef<ThumbLayout | null>(null);
  const [marks, setMarks] = useState<readonly number[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isReduced = usePrefersReducedMotion();
  const sectionIds = sections.map((section) => section.id).join(" ");

  useEffect(() => {
    const stripElement = strip.current;
    const scrollElement = container?.current;
    if (!stripElement || (container && !scrollElement)) {
      return;
    }
    const source = scrollElement
      ? elementSource(scrollElement)
      : windowSource();
    let frame = 0;

    const paint = () => {
      frame = 0;
      const layout = layoutRef.current;
      if (!layout) {
        return;
      }
      const scrollTop = source.scrollTop();
      const share = thumbShare(scrollTop, layout.anchors);
      edgeFill.current?.style.setProperty("transform", `scaleY(${share})`);
      setActiveIndex(
        clickedIndex.current ??
          activeStopIndex(
            scrollTop + source.viewport() * activeLeadShare,
            layout.stops
          )
      );
    };

    const measure = () => {
      const maxScroll = source.maxScroll();
      const stripHeight = stripElement.getBoundingClientRect().height;
      const sectionTops = sectionIds.split(" ").map((id) => {
        const element = document.querySelector(`[id="${CSS.escape(id)}"]`);
        return element ? source.sectionTop(element) : maxScroll + landingOffset;
      });
      const layout = thumbLayout({
        landingOffset,
        maxScroll,
        minGap: stripHeight > 0 ? notchGapPixels / stripHeight : 0,
        sectionTops,
      });
      layoutRef.current = layout;
      setMarks(layout.marks);
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
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(scrollElement ?? document.documentElement);
    resizeObserver.observe(stripElement);
    const stopListening = listenToScroll(source.target, {
      onScroll: schedulePaint,
      onScrollEnd: measure,
      onUserScroll: releaseClick,
    });
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      stopListening();
    };
  }, [sectionIds, container, landingOffset]);

  const shareAt = (index: number) =>
    marks?.[index] ?? evenShare(index, sections.length);

  const select = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    clickedIndex.current = index;
    setActiveIndex(index);
    const scrollElement = container?.current;
    const stop = layoutRef.current?.stops[index];
    if (!scrollElement || stop === undefined) {
      return;
    }
    event.preventDefault();
    scrollElement.scrollTo({
      behavior: isReduced ? "auto" : "smooth",
      top: stop,
    });
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "pointer-events-none fixed top-24 right-4 bottom-16 z-20 w-12",
        className
      )}
      ref={strip}
      {...props}
    >
      <span aria-hidden className="bg-border absolute inset-y-0 right-0 w-px" />
      <span
        aria-hidden
        className="bg-foreground absolute inset-y-0 right-0 w-px origin-top"
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
              className="group/notch focus-visible:ring-ring pointer-events-auto relative flex h-8 -translate-y-1/2 items-center gap-2 pl-2 outline-none focus-visible:ring-2"
              href={`#${section.id}`}
              onClick={(event) => select(event, index)}
              onKeyDown={(event) => focusSibling(event, links.current)}
              ref={(element) => {
                links.current[index] = element;
              }}
            >
              <span className="bg-background text-foreground pointer-events-none absolute right-full mr-1 translate-x-1 px-1.5 py-1 font-mono text-xs tracking-widest whitespace-nowrap uppercase opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover/notch:translate-x-0 group-hover/notch:opacity-100 group-focus-visible/notch:translate-x-0 group-focus-visible/notch:opacity-100 motion-reduce:transition-none">
                {section.label}
              </span>
              <span className="text-muted-foreground group-hover/notch:text-foreground group-aria-[current=location]/notch:text-foreground font-mono text-xs tabular-nums transition-colors duration-100 motion-reduce:transition-none">
                {notchNumber(index)}
              </span>
              <span
                aria-hidden
                className="border-border bg-muted group-hover/notch:bg-border group-aria-[current=location]/notch:border-foreground group-aria-[current=location]/notch:bg-foreground h-7 w-2.5 border-y border-l transition-[background-color,border-color] duration-300 ease-out motion-reduce:transition-none"
              />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

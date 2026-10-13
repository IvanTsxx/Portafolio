"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { holdBuild, releaseBuild } from "@/components/scene/build-hold";
import {
  clearCompanionWorksite,
  setCompanionWorksite,
} from "@/components/scene/companion-signals";
import { motionKit } from "@/lib/motion/gsap";
import type {
  BlockTiming,
  Construction,
  ConstructionEvent,
} from "@/lib/site/section-construction";
import {
  advanceConstruction,
  constructionSchedule,
  idleConstruction,
} from "@/lib/site/section-construction";

const { gsap, useGSAP } = motionKit;

interface Scaffold {
  block: HTMLElement;
  cover: HTMLElement;
  edges: readonly [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
  ordinal: string;
  root: HTMLElement;
  tag: HTMLElement | null;
  ticks: readonly HTMLElement[];
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const loadLeadInSeconds = 0.6;
const scrollLeadInSeconds = 0.12;
const launchGapSeconds = 0.16;
const labelMinWidth = 160;
const labelMinHeight = 64;

const scaffoldClass =
  "pointer-events-none absolute inset-0 z-20 select-none overflow-visible";
const coverClass =
  "bg-paper blueprint-dots pointer-events-auto absolute inset-0 [--grid-size:12px]";
const edgeClasses = [
  "bg-ink absolute inset-x-0 top-0 h-px origin-left",
  "bg-ink absolute inset-y-0 right-0 w-px origin-top",
  "bg-ink absolute inset-x-0 bottom-0 h-px origin-right",
  "bg-ink absolute inset-y-0 left-0 w-px origin-bottom",
] as const;
const tickClasses = [
  "bg-ink absolute -top-1 -left-1 size-2",
  "bg-ink absolute -top-1 -right-1 size-2",
  "bg-ink absolute -right-1 -bottom-1 size-2",
  "bg-ink absolute -bottom-1 -left-1 size-2",
] as const;
const tagClass =
  "label bg-ink text-paper absolute top-0 left-0 z-10 px-1.5 py-0.5 whitespace-nowrap tabular-nums";
const headClass = "absolute inset-0";
const headLineClass = "bg-ink absolute inset-x-0 bottom-0 h-0.5";
const nozzleClass = "bg-clay absolute bottom-0 left-0 size-3 translate-y-1/3";

const builtSections = new Set<string>();

const spawn = (parent: HTMLElement, className: string) => {
  const element = document.createElement("span");
  element.className = className;
  parent.append(element);
  return element;
};

const isShown = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement &&
  element.offsetWidth > 1 &&
  element.offsetHeight > 1;

const shownChildren = (element: Element) =>
  [...element.children].filter(isShown);

const findBlocks = (root: HTMLElement) => {
  const marked = [
    ...root.querySelectorAll<HTMLElement>("[data-build-block]"),
  ].filter(
    (element) =>
      isShown(element) &&
      !Object.hasOwn(element.dataset, "buildSelf") &&
      !element.querySelector("[data-build-block]")
  );
  if (marked.length > 0) {
    return marked;
  }
  let level = shownChildren(root);
  let [only] = level;
  while (level.length === 1 && only && shownChildren(only).length > 1) {
    level = shownChildren(only);
    [only] = level;
  }
  return level;
};

const pad = (value: number) => String(value).padStart(2, "0");

const ordinalFor = (index: number, total: number) =>
  `${pad(index + 1)}/${pad(total)}`;

const raise = (block: HTMLElement) => {
  if (getComputedStyle(block).position === "static") {
    block.style.position = "relative";
  }
};

const erect = (block: HTMLElement, index: number, total: number): Scaffold => {
  raise(block);
  const root = spawn(block, scaffoldClass);
  root.setAttribute("aria-hidden", "true");
  const cover = spawn(root, coverClass);
  const edges = [
    spawn(root, edgeClasses[0]),
    spawn(root, edgeClasses[1]),
    spawn(root, edgeClasses[2]),
    spawn(root, edgeClasses[3]),
  ] as const;
  const [top, right, bottom, left] = edges;
  const isLabelled =
    block.offsetWidth >= labelMinWidth && block.offsetHeight >= labelMinHeight;
  const ticks = isLabelled
    ? tickClasses.map((className) => spawn(root, className))
    : [];
  const ordinal = ordinalFor(index, total);
  const tag = isLabelled ? spawn(root, tagClass) : null;
  if (tag) {
    tag.textContent = `${ordinal} · ${block.offsetWidth} × ${block.offsetHeight}`;
    gsap.set(tag, { opacity: 0, y: 4 });
  }
  gsap.set([top, bottom], { scaleX: 0 });
  gsap.set([right, left], { scaleY: 0 });
  gsap.set(ticks, { opacity: 0, scale: 0.4 });
  return {
    block,
    cover,
    edges,
    ordinal,
    root,
    tag,
    ticks,
  };
};

const dismantle = (scaffold: Scaffold) => {
  scaffold.root.remove();
  scaffold.block.style.removeProperty("position");
};

const drawFrame = (
  timeline: gsap.core.Timeline,
  scaffold: Scaffold,
  timing: BlockTiming
) => {
  const edge = timing.frame / 5;
  const [top, right, bottom, left] = scaffold.edges;
  timeline
    .to(top, { duration: edge, ease: "none", scaleX: 1 }, edge * 0.5)
    .to(right, { duration: edge, ease: "none", scaleY: 1 }, ">")
    .to(bottom, { duration: edge, ease: "none", scaleX: 1 }, ">")
    .to(left, { duration: edge, ease: "power2.out", scaleY: 1 }, ">");
  if (scaffold.tag) {
    timeline
      .to(
        scaffold.ticks,
        {
          duration: edge,
          ease: "back.out(2)",
          opacity: 1,
          scale: 1,
          stagger: edge / 2,
        },
        0
      )
      .to(
        scaffold.tag,
        { duration: edge * 1.5, ease: "power3.out", opacity: 1, y: 0 },
        edge
      );
  }
};

const printBlock = (
  timeline: gsap.core.Timeline,
  scaffold: Scaffold,
  timing: BlockTiming
) => {
  const head = spawn(scaffold.root, headClass);
  spawn(head, headLineClass);
  const nozzle = spawn(head, nozzleClass);
  const layer = timing.print / timing.layers;
  const travel = Math.max(0, scaffold.block.offsetWidth - 12);
  const stepped = `steps(${timing.layers})`;
  gsap.set(head, { opacity: 0 });
  timeline
    .set(head, { opacity: 1 }, timing.frame)
    .fromTo(
      scaffold.cover,
      { clipPath: "inset(0% 0% 0% 0%)" },
      {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: timing.print,
        ease: stepped,
        pointerEvents: "none",
      },
      timing.frame
    )
    .fromTo(
      head,
      { yPercent: -100 },
      { duration: timing.print, ease: stepped, yPercent: 0 },
      timing.frame
    )
    .fromTo(
      nozzle,
      { x: 0 },
      {
        duration: layer,
        ease: "sine.inOut",
        repeat: timing.layers - 1,
        x: travel,
        yoyo: true,
      },
      timing.frame
    )
    .to(head, { duration: 0.12, opacity: 0 }, ">");
};

const finishBlock = (timeline: gsap.core.Timeline, scaffold: Scaffold) => {
  const { ordinal, tag } = scaffold;
  if (tag) {
    timeline.call(() => {
      tag.textContent = `${ordinal} · built`;
    });
  }
  timeline.to(
    scaffold.root,
    { duration: 0.28, ease: "power2.out", opacity: 0 },
    "+=0.12"
  );
};

export const SectionBuild = ({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) => {
  const site = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = site.current;
      const blocksRoot = content.current;
      if (!(root && blocksRoot && contextSafe)) {
        return;
      }
      const key = `${window.location.pathname}#${id}`;
      if (
        builtSections.has(key) ||
        window.matchMedia(reducedMotionQuery).matches
      ) {
        return;
      }
      let state: Construction = idleConstruction;
      let scaffolds: Scaffold[] = [];
      let sight: IntersectionObserver | null = null;

      const dispatch = (event: ConstructionEvent) => {
        state = advanceConstruction(state, event);
        root.dataset.construction = state.phase;
        if (state.phase === "built") {
          builtSections.add(key);
        }
      };

      const place = contextSafe((scaffold: Scaffold) => {
        dismantle(scaffold);
        releaseBuild(scaffold.block);
        clearCompanionWorksite(scaffold.block);
        dispatch({ type: "place" });
      });

      const begin = contextSafe(() => {
        const blocks = findBlocks(blocksRoot);
        scaffolds = blocks.map((block, index) =>
          erect(block, index, blocks.length)
        );
        for (const block of blocks) {
          holdBuild(block);
        }
        releaseBuild(blocksRoot);
        gsap.set(blocksRoot, { clearProps: "opacity" });
        dispatch({ total: blocks.length, type: "begin" });
        const schedule = constructionSchedule(
          blocks.map((block) => block.offsetHeight)
        );
        const beganAt = gsap.ticker.time;
        let lastLaunch = Number.NEGATIVE_INFINITY;
        const launch = contextSafe((index: number) => {
          const scaffold = scaffolds[index];
          const timing = schedule[index];
          if (!(scaffold && timing)) {
            return;
          }
          const now = gsap.ticker.time;
          const at = Math.max(
            now,
            beganAt + timing.start,
            lastLaunch + launchGapSeconds
          );
          lastLaunch = at;
          const timeline = gsap.timeline({
            delay: at - now,
            onComplete: () => place(scaffold),
            onStart: () => setCompanionWorksite(scaffold.block),
          });
          drawFrame(timeline, scaffold, timing);
          printBlock(timeline, scaffold, timing);
          finishBlock(timeline, scaffold);
        });
        sight = new IntersectionObserver(
          contextSafe((entries: IntersectionObserverEntry[]) => {
            const seen: number[] = [];
            for (const entry of entries) {
              if (entry.isIntersecting && entry.target instanceof HTMLElement) {
                seen.push(blocks.indexOf(entry.target));
              }
            }
            seen.sort((first, second) => first - second);
            for (const index of seen) {
              const block = blocks[index];
              if (block) {
                sight?.unobserve(block);
              }
              launch(index);
            }
          }),
          { rootMargin: "0px 0px -10% 0px" }
        );
        for (const block of blocks) {
          sight.observe(block);
        }
      });

      dispatch({ type: "arm" });
      holdBuild(blocksRoot);
      gsap.set(blocksRoot, { opacity: 0 });

      let isFirstReport = true;
      const view = new IntersectionObserver(
        contextSafe(([entry]: IntersectionObserverEntry[]) => {
          const leadIn = isFirstReport
            ? loadLeadInSeconds
            : scrollLeadInSeconds;
          isFirstReport = false;
          if (!entry?.isIntersecting) {
            return;
          }
          view.disconnect();
          gsap.delayedCall(leadIn, begin);
        }),
        { rootMargin: "0px 0px -15% 0px" }
      );
      view.observe(root);

      return () => {
        view.disconnect();
        sight?.disconnect();
        for (const scaffold of scaffolds) {
          dismantle(scaffold);
          releaseBuild(scaffold.block);
          clearCompanionWorksite(scaffold.block);
        }
        releaseBuild(blocksRoot);
        delete root.dataset.construction;
      };
    },
    { dependencies: [id], scope: site }
  );

  return (
    <div className="relative" ref={site}>
      <div className="flex flex-col gap-6" ref={content}>
        {children}
      </div>
    </div>
  );
};

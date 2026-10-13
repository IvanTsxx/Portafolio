"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { holdBuild, releaseBuild } from "@/components/scene/build-hold";
import { motionKit } from "@/lib/motion/gsap";
import type {
  BlockTiming,
  BuildBlock,
  BuildTool,
  Construction,
  ConstructionEvent,
} from "@/lib/site/section-construction";
import {
  advanceConstruction,
  constructionSchedule,
  idleConstruction,
  passGapSeconds,
} from "@/lib/site/section-construction";

const { gsap, useGSAP } = motionKit;

interface Tag {
  built: HTMLElement;
  plan: HTMLElement;
  root: HTMLElement;
}

interface Scaffold {
  block: HTMLElement;
  cover: HTMLElement;
  dots: HTMLElement;
  edges: readonly [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
  height: number;
  rails: readonly HTMLElement[];
  root: HTMLElement;
  tag: Tag | null;
  ticks: readonly HTMLElement[];
  width: number;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const loadLeadInSeconds = 0.6;
const scrollLeadInSeconds = 0.12;
const compactMaxWidth = 200;
const compactMaxHeight = 128;
const carriageInset = 10;

const easeDraw = "power2.inOut";
const easeStep = "power3.inOut";
const easeTravel = "sine.inOut";
const easeEnter = "power3.out";
const easeLeave = "power2.out";

const scaffoldClass =
  "pointer-events-none absolute inset-0 z-20 select-none overflow-visible";
const coverClass = "bg-paper pointer-events-auto absolute inset-0";
const dotsClass = "blueprint-dots absolute inset-0 [--grid-size:12px]";
const edgeTones: Record<BuildTool, string> = {
  gantry: "bg-ink",
  sweep: "bg-rule",
};
const edgePlacements = [
  "absolute inset-x-0 top-0 h-px origin-left",
  "absolute inset-y-0 right-0 w-px origin-top",
  "absolute inset-x-0 bottom-0 h-px origin-left",
  "absolute inset-y-0 left-0 w-px origin-top",
] as const;
const retractOrigins = [
  "right center",
  "center bottom",
  "left center",
  "center top",
] as const;
const tickClasses = [
  "bg-paper border-ink absolute -top-0.75 -left-0.75 size-1.75 border",
  "bg-paper border-ink absolute -top-0.75 -right-0.75 size-1.75 border",
  "bg-paper border-ink absolute -right-0.75 -bottom-0.75 size-1.75 border",
  "bg-paper border-ink absolute -bottom-0.75 -left-0.75 size-1.75 border",
] as const;
const railClasses = [
  "bg-rule-strong absolute inset-y-0 -left-1.5 w-px origin-top",
  "bg-rule-strong absolute inset-y-0 -right-1.5 w-px origin-top",
] as const;
const tagClass =
  "label bg-ink text-paper absolute top-0 left-0 z-10 grid px-1.5 py-0.5 whitespace-nowrap tabular-nums";
const tagFaceClass = "col-start-1 row-start-1";
const headClass = "absolute inset-0";
const gantryClass = "bg-ink absolute -inset-x-1.5 bottom-0 h-px";
const sweepClass = "bg-ink absolute inset-x-0 bottom-0 h-px";
const depositClass =
  "from-clay/25 absolute inset-x-0 bottom-0 h-3 bg-linear-to-t to-transparent";
const bearingClasses = [
  "bg-paper border-ink absolute bottom-0 -left-2.5 size-2 translate-y-1/2 border",
  "bg-paper border-ink absolute -right-2.5 bottom-0 size-2 translate-y-1/2 border",
] as const;
const carriageClass = "absolute bottom-0 left-0";
const carriageBodyClass =
  "bg-paper border-ink absolute bottom-0 left-0 flex h-2.5 w-5 -translate-x-1/2 translate-y-1/2 items-center justify-center border";
const nozzleClass = "bg-clay size-1 rounded-full";
const readoutClass =
  "label bg-paper text-ink absolute top-full right-0 mt-2 px-1 tabular-nums";
const flashClass = "bg-clay absolute inset-x-0 top-0 h-0.5 origin-left";

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

const buildsItself = (element: Element) =>
  element.closest("[data-build-self]") !== null;

const isPrintable = (element: Element): element is HTMLElement =>
  isShown(element) && !buildsItself(element);

const printableChildren = (element: Element) =>
  [...element.children].filter(isPrintable);

const findBlocks = (root: HTMLElement) => {
  const marked = [...root.querySelectorAll<HTMLElement>("[data-build-block]")];
  if (marked.length > 0) {
    return marked.filter(
      (element) =>
        isPrintable(element) && !element.querySelector("[data-build-block]")
    );
  }
  let level = printableChildren(root);
  let [only] = level;
  while (level.length === 1 && only && printableChildren(only).length > 1) {
    level = printableChildren(only);
    [only] = level;
  }
  return level;
};

const inReadingOrder = (blocks: readonly HTMLElement[]) =>
  blocks
    .map((block) => ({ block, box: block.getBoundingClientRect() }))
    .toSorted(
      (first, second) =>
        Math.round(first.box.top - second.box.top) ||
        first.box.left - second.box.left
    )
    .map(({ block }) => block);

const toBuildBlocks = (blocks: readonly HTMLElement[]): BuildBlock[] => {
  const parents = new Map<Element, number>();
  return blocks.map((block) => {
    const parent = block.parentElement ?? block;
    const parentIndex = parents.get(parent) ?? parents.size;
    parents.set(parent, parentIndex);
    return {
      compact:
        block.offsetWidth < compactMaxWidth ||
        block.offsetHeight < compactMaxHeight,
      height: block.offsetHeight,
      parent: parentIndex,
    };
  });
};

const pad = (value: number) => String(value).padStart(2, "0");

const ordinalFor = (index: number, total: number) =>
  `${pad(index + 1)}/${pad(total)}`;

const raise = (block: HTMLElement) => {
  if (getComputedStyle(block).position === "static") {
    block.style.position = "relative";
  }
};

const spawnTag = (parent: HTMLElement, plan: string, built: string): Tag => {
  const root = spawn(parent, tagClass);
  const planFace = spawn(root, tagFaceClass);
  planFace.textContent = plan;
  const builtFace = spawn(root, tagFaceClass);
  builtFace.textContent = built;
  gsap.set(root, { opacity: 0, y: 3 });
  gsap.set(builtFace, { opacity: 0, y: 4 });
  return { built: builtFace, plan: planFace, root };
};

const erect = (
  block: HTMLElement,
  index: number,
  total: number,
  timing: BlockTiming
): Scaffold => {
  raise(block);
  const width = block.offsetWidth;
  const height = block.offsetHeight;
  const root = spawn(block, scaffoldClass);
  root.setAttribute("aria-hidden", "true");
  const cover = spawn(root, coverClass);
  const dots = spawn(cover, dotsClass);
  const tone = edgeTones[timing.tool];
  const edges = [
    spawn(root, `${tone} ${edgePlacements[0]}`),
    spawn(root, `${tone} ${edgePlacements[1]}`),
    spawn(root, `${tone} ${edgePlacements[2]}`),
    spawn(root, `${tone} ${edgePlacements[3]}`),
  ] as const;
  const isGantry = timing.tool === "gantry";
  const rails = isGantry
    ? railClasses.map((className) => spawn(root, className))
    : [];
  const ticks = isGantry
    ? tickClasses.map((className) => spawn(root, className))
    : [];
  const ordinal = ordinalFor(index, total);
  const tag = isGantry
    ? spawnTag(
        root,
        `${ordinal} · ${width} × ${height}`,
        `${ordinal} · built ✓`
      )
    : null;
  const [top, right, bottom, left] = edges;
  gsap.set(cover, { clipPath: "inset(0% 0% 0% 0%)" });
  gsap.set(dots, { opacity: 0 });
  gsap.set([top, bottom], { scaleX: 0 });
  gsap.set([right, left, ...rails], { scaleY: 0 });
  gsap.set(ticks, { opacity: 0, scale: 0.5 });
  return {
    block,
    cover,
    dots,
    edges,
    height,
    rails,
    root,
    tag,
    ticks,
    width,
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
  const leg = timing.frame / 2;
  const [top, right, bottom, left] = scaffold.edges;
  const [firstTick, ...restTicks] = scaffold.ticks;
  timeline
    .to(scaffold.dots, { duration: timing.frame, ease: "none", opacity: 1 }, 0)
    .to(top, { duration: leg, ease: easeDraw, scaleX: 1 }, 0)
    .to(left, { duration: leg, ease: easeDraw, scaleY: 1 }, 0)
    .to(right, { duration: leg, ease: easeDraw, scaleY: 1 }, leg)
    .to(bottom, { duration: leg, ease: easeDraw, scaleX: 1 }, leg);
  if (scaffold.rails.length > 0) {
    timeline.to(
      scaffold.rails,
      { duration: timing.frame, ease: easeDraw, scaleY: 1 },
      leg * 0.5
    );
  }
  if (firstTick) {
    timeline
      .to(
        firstTick,
        { duration: 0.2, ease: easeEnter, opacity: 1, scale: 1 },
        0
      )
      .to(
        restTicks,
        { duration: 0.2, ease: easeEnter, opacity: 1, scale: 1, stagger: 0.06 },
        leg
      );
  }
  if (scaffold.tag) {
    timeline.to(
      scaffold.tag.root,
      { duration: 0.35, ease: easeEnter, opacity: 1, y: 0 },
      leg
    );
  }
};

const assembleHead = (scaffold: Scaffold, timing: BlockTiming) => {
  const head = spawn(scaffold.root, headClass);
  if (timing.tool === "sweep") {
    spawn(head, sweepClass);
    return { carriage: null, head, readout: null };
  }
  spawn(head, depositClass);
  spawn(head, gantryClass);
  for (const className of bearingClasses) {
    spawn(head, className);
  }
  const carriage = spawn(head, carriageClass);
  spawn(spawn(carriage, carriageBodyClass), nozzleClass);
  const readout = spawn(head, readoutClass);
  return { carriage, head, readout };
};

const readoutFor = (layer: number, depth: number) =>
  `L${pad(layer)} · y ${Math.round(depth)}`;

const printBlock = (
  timeline: gsap.core.Timeline,
  scaffold: Scaffold,
  timing: BlockTiming
) => {
  const { carriage, head, readout } = assembleHead(scaffold, timing);
  const begin = timing.frame + timing.pause;
  const layer = timing.print / timing.layers;
  const travel = layer * 0.6;
  const step = layer - travel;
  const near = carriageInset;
  const far = Math.max(near, scaffold.width - carriageInset);
  gsap.set(head, { opacity: 0, yPercent: -100 });
  if (carriage) {
    gsap.set(carriage, { x: near });
  }
  if (readout) {
    readout.textContent = readoutFor(1, 0);
  }
  timeline.to(
    head,
    { duration: 0.25, ease: easeEnter, opacity: 1 },
    begin - 0.25
  );
  for (let index = 0; index < timing.layers; index += 1) {
    const at = begin + index * layer;
    const share = (index + 1) / timing.layers;
    if (carriage) {
      timeline.to(
        carriage,
        { duration: travel, ease: easeTravel, x: index % 2 === 0 ? far : near },
        at
      );
    }
    if (readout) {
      const text = readoutFor(index + 1, scaffold.height * share);
      timeline.call(
        () => {
          readout.textContent = text;
        },
        undefined,
        at
      );
    }
    timeline
      .to(
        head,
        { duration: step, ease: easeStep, yPercent: -100 + share * 100 },
        at + travel
      )
      .to(
        scaffold.cover,
        {
          clipPath: `inset(${share * 100}% 0% 0% 0%)`,
          duration: step,
          ease: easeStep,
        },
        at + travel
      );
  }
  timeline
    .set(scaffold.cover, { pointerEvents: "none" }, begin + timing.print)
    .call(() => releaseBuild(scaffold.block), undefined, begin + timing.print)
    .to(
      head,
      { duration: 0.22, ease: easeLeave, opacity: 0 },
      begin + timing.print
    );
};

const settleBlock = (
  timeline: gsap.core.Timeline,
  scaffold: Scaffold,
  timing: BlockTiming
) => {
  const at = timing.frame + timing.pause + timing.print;
  const retract = timing.settle * 0.5;
  const retractAt = at + timing.settle - retract;
  const { edges, rails, tag, ticks } = scaffold;
  const [top, right, bottom, left] = edges;
  if (tag) {
    const flash = spawn(scaffold.root, flashClass);
    gsap.set(flash, { scaleX: 0 });
    timeline
      .to(flash, { duration: 0.4, ease: "expo.out", scaleX: 1 }, at)
      .to(flash, { duration: 0.35, ease: easeLeave, opacity: 0 }, at + 0.3)
      .to(tag.plan, { duration: 0.2, ease: easeLeave, opacity: 0, y: -4 }, at)
      .to(
        tag.built,
        { duration: 0.25, ease: easeEnter, opacity: 1, y: 0 },
        at + 0.08
      )
      .to(
        tag.root,
        { duration: 0.25, ease: easeLeave, opacity: 0 },
        retractAt + retract * 0.4
      );
  }
  for (const [index, edge] of edges.entries()) {
    timeline.set(edge, { transformOrigin: retractOrigins[index] }, retractAt);
  }
  timeline
    .to(
      [top, bottom],
      { duration: retract, ease: easeStep, scaleX: 0 },
      retractAt
    )
    .to(
      [right, left],
      { duration: retract, ease: easeStep, scaleY: 0 },
      retractAt
    );
  if (rails.length > 0) {
    timeline
      .set(rails, { transformOrigin: "center bottom" }, retractAt)
      .to(rails, { duration: retract, ease: easeStep, scaleY: 0 }, retractAt);
  }
  if (ticks.length > 0) {
    timeline.to(
      ticks,
      { duration: 0.25, ease: easeLeave, opacity: 0, scale: 0.5 },
      retractAt + retract * 0.6
    );
  }
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
        dispatch({ type: "place" });
      });

      const begin = contextSafe(() => {
        const blocks = inReadingOrder(findBlocks(blocksRoot));
        const schedule = constructionSchedule(toBuildBlocks(blocks));
        scaffolds = blocks.flatMap((block, index) => {
          const timing = schedule[index];
          return timing ? [erect(block, index, blocks.length, timing)] : [];
        });
        for (const block of blocks) {
          holdBuild(block);
        }
        releaseBuild(blocksRoot);
        gsap.set(blocksRoot, { clearProps: "opacity" });
        dispatch({ total: blocks.length, type: "begin" });
        const beganAt = gsap.ticker.time;
        const passLaunches = new Map<number, number>();
        let lastPassLaunch = Number.NEGATIVE_INFINITY;
        const launchTimeFor = (timing: BlockTiming, now: number) => {
          const passLaunch = passLaunches.get(timing.pass);
          if (passLaunch !== undefined) {
            return Math.max(now, passLaunch + timing.offset);
          }
          const at = Math.max(
            now,
            beganAt + timing.start - timing.offset,
            lastPassLaunch + passGapSeconds
          );
          passLaunches.set(timing.pass, at);
          lastPassLaunch = at;
          return at + timing.offset;
        };
        const launch = contextSafe((index: number) => {
          const scaffold = scaffolds[index];
          const timing = schedule[index];
          if (!(scaffold && timing)) {
            return;
          }
          const now = gsap.ticker.time;
          const at = launchTimeFor(timing, now);
          const timeline = gsap.timeline({
            delay: at - now,
            onComplete: () => place(scaffold),
          });
          drawFrame(timeline, scaffold, timing);
          printBlock(timeline, scaffold, timing);
          settleBlock(timeline, scaffold, timing);
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

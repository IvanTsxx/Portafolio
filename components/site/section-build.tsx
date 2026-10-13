"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import type { CompanionBeat } from "@/components/scene/companion-signals";
import {
  getCompanionStop,
  subscribeCompanionBeat,
} from "@/components/scene/companion-signals";
import { motionKit } from "@/lib/motion/gsap";
import type {
  Construction,
  ConstructionEvent,
} from "@/lib/site/section-construction";
import {
  advanceConstruction,
  blocksForBeat,
  idleConstruction,
} from "@/lib/site/section-construction";

const { gsap, useGSAP } = motionKit;

interface Point {
  x: number;
  y: number;
}

interface Box {
  height: number;
  left: number;
  top: number;
  width: number;
}

interface BuildSite {
  block: HTMLElement;
  box: Box;
  outline: HTMLElement;
}

const foldLine = 0.85;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const companionGraceSeconds = 0.6;
const companionArrivalSeconds = 2.4;
const decisionPollSeconds = 0.2;
const stallSeconds = 1.4;
const selfBeatSeconds = 0.16;
const groupStaggerSeconds = 0.06;
const dropSeconds = 0.16;
const dropPixels = 12;
const brickHalf = 4;
const dustReach = [6, 14, 22] as const;
const dustRise = [10, 4, 14] as const;

const outlineClass =
  "border-rule-strong blueprint-dots absolute top-0 left-0 border border-dashed [--grid-size:12px]";
const tagClass =
  "label text-mist bg-paper absolute -top-2 left-2 px-1 tabular-nums";
const brickClass = "bg-ink absolute top-0 left-0 size-2";
const dustClass = "bg-ink absolute top-0 left-0 size-1";

const builtSections = new Set<string>();

const spawn = (parent: HTMLElement, className: string) => {
  const element = document.createElement("span");
  element.className = className;
  parent.append(element);
  return element;
};

const findBlocks = (root: HTMLElement) => {
  const marked = [...root.querySelectorAll<HTMLElement>("[data-build-block]")];
  if (marked.length > 0) {
    return marked;
  }
  const direct = [...root.children];
  const [only] = direct;
  const level =
    direct.length === 1 && only && only.children.length > 1
      ? [...only.children]
      : direct;
  return level.filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.getClientRects().length > 0
  );
};

const tagFor = (index: number, total: number) =>
  `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

const arcPoint = (from: Point, apex: number, to: Point, progress: number) => {
  const rest = 1 - progress;
  return {
    x: from.x + (to.x - from.x) * progress,
    y: rest * rest * from.y + 2 * rest * progress * apex + progress ** 2 * to.y,
  };
};

const throwBrick = (
  timeline: gsap.core.Timeline,
  overlay: HTMLElement,
  from: Point,
  to: Point,
  spin: number
) => {
  const brick = spawn(overlay, brickClass);
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const flight = gsap.utils.clamp(0.22, 0.42, 0.2 + distance / 2400);
  const apex =
    Math.min(from.y, to.y) - gsap.utils.clamp(24, 96, distance * 0.18);
  const path = { progress: 0 };
  const draw = () => {
    const point = arcPoint(from, apex, to, path.progress);
    brick.style.transform = `translate3d(${point.x - brickHalf}px, ${point.y - brickHalf}px, 0) rotate(${path.progress * spin}deg)`;
  };
  draw();
  timeline
    .fromTo(brick, { opacity: 0 }, { duration: 0.06, opacity: 1 }, 0)
    .to(
      path,
      { duration: flight, ease: "power1.in", onUpdate: draw, progress: 1 },
      0
    )
    .call(() => brick.remove(), [], flight);
  return flight;
};

const kickDust = (
  timeline: gsap.core.Timeline,
  overlay: HTMLElement,
  box: Box,
  at: number
) => {
  const floor = box.top + box.height;
  for (const [corner, direction] of [
    [box.left, -1],
    [box.left + box.width, 1],
  ] as const) {
    for (const [index, reach] of dustReach.entries()) {
      const dust = spawn(overlay, dustClass);
      gsap.set(dust, { opacity: 0, x: corner - 2, y: floor - 2 });
      timeline.set(dust, { opacity: 1 }, at).to(
        dust,
        {
          duration: 0.42,
          ease: "expo.out",
          onComplete: () => dust.remove(),
          opacity: 0,
          rotation: direction * 90,
          x: corner - 2 + direction * reach,
          y: floor - 2 - (dustRise[index] ?? 0),
        },
        at
      );
    }
  }
};

const layBlock = (
  overlay: HTMLElement,
  site: BuildSite,
  origin: Point | null,
  delay: number,
  spin: number,
  onSettled: () => void
) => {
  const { block, box, outline } = site;
  const timeline = gsap.timeline({ delay, onComplete: onSettled });
  const flight = origin
    ? throwBrick(
        timeline,
        overlay,
        origin,
        { x: box.left + box.width / 2, y: box.top },
        spin
      )
    : 0;
  const impact = flight + dropSeconds;
  const squash = 1 - Math.min(0.02, 6 / Math.max(box.height, 1));
  timeline
    .fromTo(
      block,
      { opacity: 0, y: -dropPixels },
      { duration: dropSeconds, ease: "power2.in", opacity: 1, y: 0 },
      flight
    )
    .to(
      block,
      {
        duration: 0.06,
        ease: "power1.out",
        scaleX: 1 + (1 - squash) * 0.3,
        scaleY: squash,
        transformOrigin: "50% 100%",
      },
      impact
    )
    .to(block, {
      clearProps: "opacity,pointerEvents,transform,transformOrigin",
      duration: 0.3,
      ease: "expo.out",
      scaleX: 1,
      scaleY: 1,
    })
    .set(outline, { borderColor: "var(--ink)", borderStyle: "solid" }, impact)
    .to(
      outline,
      {
        duration: 0.32,
        ease: "power2.out",
        onComplete: () => outline.remove(),
        opacity: 0,
      },
      impact
    );
  kickDust(timeline, overlay, box, impact);
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
  const scaffold = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = site.current;
      const blocksRoot = content.current;
      const overlay = scaffold.current;
      if (!(root && blocksRoot && overlay && contextSafe)) {
        return;
      }
      const key = `${window.location.pathname}#${id}`;
      if (
        builtSections.has(key) ||
        window.matchMedia(reducedMotionQuery).matches ||
        root.getBoundingClientRect().top < window.innerHeight * foldLine
      ) {
        builtSections.add(key);
        return;
      }
      const section = root.closest("section") ?? root;
      const sites: BuildSite[] = findBlocks(blocksRoot).map(
        (block, index, all) => {
          const outline = spawn(overlay, outlineClass);
          spawn(outline, tagClass).textContent = tagFor(index, all.length);
          return {
            block,
            box: { height: 0, left: 0, top: 0, width: 0 },
            outline,
          };
        }
      );
      let state: Construction = idleConstruction;
      let isInView = false;
      let settled = 0;
      let decision: gsap.core.Tween | null = null;
      let stall: gsap.core.Tween | null = null;

      const measure = () => {
        if (!(state.phase === "waiting" || state.phase === "constructing")) {
          return;
        }
        const origin = root.getBoundingClientRect();
        const placed = state.phase === "constructing" ? state.placed : 0;
        for (const entry of sites.slice(placed)) {
          const rect = entry.block.getBoundingClientRect();
          entry.box = {
            height: rect.height,
            left: rect.left - origin.left,
            top: rect.top - origin.top,
            width: rect.width,
          };
          gsap.set(entry.outline, {
            height: entry.box.height,
            width: entry.box.width,
            x: entry.box.left,
            y: entry.box.top,
          });
        }
      };

      const settle = () => {
        settled += 1;
        if (settled === sites.length) {
          overlay.replaceChildren();
        }
      };

      const enter = (next: Construction, previous: Construction) => {
        root.dataset.construction = next.phase;
        if (next.phase === "waiting") {
          gsap.set(
            sites.map((entry) => entry.block),
            { opacity: 0, pointerEvents: "none" }
          );
          measure();
          return;
        }
        if (next.phase === "built") {
          decision?.kill();
          stall?.kill();
          builtSections.add(key);
          return;
        }
        if (next.phase === "constructing" && previous.phase === "waiting") {
          decision?.kill();
          measure();
        }
      };

      const dispatch = (event: ConstructionEvent) => {
        const next = advanceConstruction(state, event);
        if (next === state) {
          return;
        }
        const previous = state;
        state = next;
        enter(next, previous);
      };

      const lay = contextSafe((count: number, origin: Point | null) => {
        if (state.phase !== "constructing") {
          return;
        }
        const group = sites.slice(state.placed, state.placed + count);
        for (const [offset, entry] of group.entries()) {
          layBlock(
            overlay,
            entry,
            origin,
            offset * groupStaggerSeconds,
            (state.placed + offset) % 2 === 0 ? 180 : -180,
            settle
          );
        }
        dispatch({ count: group.length, type: "place" });
      });

      const selfBeat = contextSafe(() => {
        if (state.phase !== "constructing" || state.source !== "self") {
          return;
        }
        lay(1, null);
        gsap.delayedCall(selfBeatSeconds, selfBeat);
      });

      const buildAlone = contextSafe((event: ConstructionEvent) => {
        stall?.kill();
        dispatch(event);
        selfBeat();
      });

      const decide = contextSafe((waited: number) => {
        const stop = getCompanionStop();
        const isComing = stop !== null && section.contains(stop);
        const limit = isComing
          ? companionArrivalSeconds
          : companionGraceSeconds;
        if (waited >= limit) {
          buildAlone({ source: "self", type: "begin" });
          return;
        }
        decision = gsap.delayedCall(decisionPollSeconds, () =>
          decide(waited + decisionPollSeconds)
        );
      });

      const onBeat = contextSafe((beat: CompanionBeat) => {
        if (!(isInView && section.contains(beat.waypoint))) {
          return;
        }
        dispatch({ source: "companion", type: "begin" });
        if (state.phase !== "constructing" || state.source !== "companion") {
          return;
        }
        const origin = root.getBoundingClientRect();
        lay(blocksForBeat(state.placed, state.total), {
          x: beat.x - origin.left,
          y: beat.y - origin.top,
        });
        stall?.kill();
        if (state.phase === "constructing") {
          stall = gsap.delayedCall(stallSeconds, () =>
            buildAlone({ type: "handoff" })
          );
        }
      });

      dispatch({ total: sites.length, type: "arm" });
      if (state.phase === "built") {
        return;
      }

      const resize = new ResizeObserver(() => measure());
      resize.observe(root);
      const view = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) {
            return;
          }
          view.disconnect();
          isInView = true;
          decide(0);
        },
        { rootMargin: "0px 0px -15% 0px" }
      );
      view.observe(root);
      const unsubscribe = subscribeCompanionBeat(onBeat);

      return () => {
        unsubscribe();
        view.disconnect();
        resize.disconnect();
        overlay.replaceChildren();
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 select-none"
        ref={scaffold}
      />
    </div>
  );
};

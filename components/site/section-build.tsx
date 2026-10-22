"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { holdBuild, releaseBuild } from "@/components/scene/build-hold";
import { registerCompanionStage } from "@/components/scene/companion-stages";
import { motionKit } from "@/lib/motion/gsap";
import type {
  Construction,
  ConstructionEvent,
} from "@/lib/site/section-construction";
import {
  advanceConstruction,
  blockBuildSeconds,
  blockRisePixels,
  buildDeadlineSeconds,
  buildStagger,
  idleConstruction,
  startsHidden,
} from "@/lib/site/section-construction";

const { gsap, useGSAP } = motionKit;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const companionStayMilliseconds = 1200;
const builderInset = 28;
const builderYaw = -0.6;
const easeEnter = "expo.out";
const blockStartScale = 0.985;
const revealMargin = "0px 0px -6% 0px";

const builtSections = new Set<string>();
let buildSites = 0;

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

const callCompanion = (block: HTMLElement) => {
  buildSites += 1;
  return registerCompanionStage({
    figure: block,
    id: `build-site-${buildSites}`,
    spot: () => {
      const box = block.getBoundingClientRect();
      return {
        action: "build",
        height: null,
        x: Math.max(box.left + builderInset, box.right - builderInset),
        y: box.top,
        yaw: builderYaw,
      };
    },
  });
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
        window.matchMedia(reducedMotionQuery).matches ||
        !startsHidden(root.getBoundingClientRect().top, window.innerHeight)
      ) {
        builtSections.add(key);
        return;
      }
      let state: Construction = idleConstruction;
      let dismissCompanion: (() => void) | null = null;
      const timers: number[] = [];
      const observers: IntersectionObserver[] = [];

      const dispatch = (event: ConstructionEvent) => {
        state = advanceConstruction(state, event);
        root.dataset.construction = state.phase;
        if (state.phase === "built") {
          builtSections.add(key);
        }
      };

      const begin = contextSafe(() => {
        const blocks = inReadingOrder(findBlocks(blocksRoot));
        dispatch({ total: blocks.length, type: "begin" });
        releaseBuild(blocksRoot);
        const [first] = blocks;
        if (!first) {
          gsap.set(blocksRoot, { clearProps: "opacity" });
          return;
        }
        const enter = {
          clearProps: "opacity,transform",
          duration: blockBuildSeconds,
          ease: easeEnter,
          opacity: 1,
          scale: 1,
          y: 0,
        };
        gsap.set(blocks, {
          opacity: 0,
          scale: blockStartScale,
          transformOrigin: "50% 0%",
          y: blockRisePixels,
        });
        gsap.set(blocksRoot, { clearProps: "opacity" });
        const fold = window.innerHeight;
        const inView: HTMLElement[] = [];
        const below: HTMLElement[] = [];
        for (const block of blocks) {
          (block.getBoundingClientRect().top < fold ? inView : below).push(
            block
          );
        }
        const timeline = gsap.timeline({
          onComplete: () => dispatch({ type: "finish" }),
        });
        timeline.to(inView, {
          ...enter,
          stagger: buildStagger(inView.length),
        });
        if (below.length > 0) {
          const pending = new Map<Element, HTMLElement>(
            below.map((block) => [block, block])
          );
          const reveal = new IntersectionObserver(
            contextSafe((entries: IntersectionObserverEntry[]) => {
              const entering: HTMLElement[] = [];
              for (const { isIntersecting, target } of entries) {
                const block = pending.get(target);
                if (isIntersecting && block) {
                  entering.push(block);
                }
              }
              for (const block of entering) {
                pending.delete(block);
                reveal.unobserve(block);
              }
              if (entering.length > 0) {
                gsap.to(inReadingOrder(entering), {
                  ...enter,
                  stagger: buildStagger(entering.length),
                });
              }
              if (pending.size === 0) {
                reveal.disconnect();
              }
            }),
            { rootMargin: revealMargin }
          );
          for (const block of below) {
            reveal.observe(block);
          }
          observers.push(reveal);
        }
        dismissCompanion = callCompanion(first);
        timers.push(
          window.setTimeout(
            () => timeline.progress(1),
            buildDeadlineSeconds(inView.length) * 1000
          ),
          window.setTimeout(() => {
            dismissCompanion?.();
            dismissCompanion = null;
          }, companionStayMilliseconds)
        );
      });

      dispatch({ type: "arm" });
      holdBuild(blocksRoot);
      gsap.set(blocksRoot, { opacity: 0 });

      const view = new IntersectionObserver(
        contextSafe(([entry]: IntersectionObserverEntry[]) => {
          if (!entry?.isIntersecting) {
            return;
          }
          view.disconnect();
          begin();
        }),
        { rootMargin: revealMargin }
      );
      view.observe(root);
      observers.push(view);

      return () => {
        for (const observer of observers) {
          observer.disconnect();
        }
        for (const timer of timers) {
          window.clearTimeout(timer);
        }
        dismissCompanion?.();
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

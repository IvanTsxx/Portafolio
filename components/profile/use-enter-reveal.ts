"use client";

import type { RefObject } from "react";

import { motionKit } from "@/lib/motion/gsap";

const { gsap, ScrollTrigger, useGSAP } = motionKit;

type Timeline = ReturnType<typeof gsap.timeline>;

const groupedFormat = new Intl.NumberFormat("en-US");

const countTextOf = (target: HTMLElement | SVGElement, progress: number) => {
  const { countGroup, countPad, countSuffix, countTo } = target.dataset;
  const value = Math.round(Number(countTo ?? 0) * progress);
  const digits =
    countGroup === "true"
      ? groupedFormat.format(value)
      : String(value).padStart(Number(countPad ?? 0), "0");
  return `${digits}${countSuffix ?? ""}`;
};

const writeCount = (target: HTMLElement | SVGElement, progress: number) => {
  const node = target.firstChild;
  if (node?.nodeType === Node.TEXT_NODE) {
    node.nodeValue = countTextOf(target, progress);
  }
};

export const countUp = (
  timeline: Timeline,
  targets: readonly (HTMLElement | SVGElement)[],
  vars: { duration: number; position: number }
) => {
  for (const target of targets) {
    const counter = { progress: 0 };
    writeCount(target, 0);
    timeline.to(
      counter,
      {
        duration: vars.duration,
        ease: "power2.out",
        onUpdate: () => writeCount(target, counter.progress),
        progress: 1,
      },
      vars.position
    );
  }
  return () => {
    for (const target of targets) {
      writeCount(target, 1);
    }
  };
};

export const selectAll = <Target extends Element = HTMLElement | SVGElement>(
  root: Element,
  selector: string
) => [...root.querySelectorAll<Target>(selector)];

export const useEnterReveal = (
  scope: RefObject<HTMLElement | null>,
  choreograph: (root: HTMLElement, timeline: Timeline) => () => void
) => {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) {
        return;
      }
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({
          defaults: { ease: "expo.out" },
          paused: true,
        });
        const restore = choreograph(root, timeline);
        ScrollTrigger.create({
          onEnter: () => timeline.play(),
          once: true,
          start: "top 80%",
          trigger: root,
        });
        return restore;
      });
      return () => media.revert();
    },
    { scope }
  );
};

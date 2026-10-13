"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

const TOUR_FIRST_MS = 1400;
const TOUR_EVERY_MS = 3200;
const QUIET_MS = 3600;

export type TourStep =
  | { job: number; kind: "peek" }
  | { job: number; kind: "punch" }
  | { kind: "hold" }
  | { kind: "return" };

export const tourOf = (count: number, current: number): TourStep[] => [
  ...Array.from({ length: count }, (_, job): TourStep => ({
    job,
    kind: "peek",
  })),
  { job: current, kind: "punch" },
  { kind: "hold" },
  { kind: "return" },
];

export const useClockTour = ({
  count,
  current,
  feed,
  isActive,
  preview,
  release,
  root,
}: {
  count: number;
  current: number;
  feed: (job: number) => void;
  isActive: boolean;
  preview: (job: number | null) => void;
  release: () => void;
  root: RefObject<HTMLElement | null>;
}) => {
  const index = useRef(0);
  const lastTouch = useRef(Number.NEGATIVE_INFINITY);
  const actions = useRef({ feed, preview, release });

  useEffect(() => {
    actions.current = { feed, preview, release };
  });

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const steps = tourOf(count, current);
    let timer = 0;
    const later = (delay: number) => {
      timer = window.setTimeout(() => {
        const quiet = performance.now() - lastTouch.current;
        if (quiet < QUIET_MS) {
          later(QUIET_MS - quiet);
          return;
        }
        if (root.current?.dataset.assembled === undefined) {
          later(TOUR_FIRST_MS);
          return;
        }
        const step = steps[index.current % steps.length];
        index.current += 1;
        if (step?.kind === "peek") {
          actions.current.preview(step.job);
        }
        if (step?.kind === "punch") {
          actions.current.preview(null);
          actions.current.feed(step.job);
        }
        if (step?.kind === "return") {
          actions.current.release();
        }
        later(TOUR_EVERY_MS);
      }, delay);
    };
    later(TOUR_FIRST_MS);
    return () => window.clearTimeout(timer);
  }, [count, current, isActive, root]);

  return useCallback(() => {
    lastTouch.current = performance.now();
  }, []);
};

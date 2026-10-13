"use client";

import { useEffect, useEffectEvent } from "react";
import type { RefObject } from "react";

const TOUR_FIRST_MS = 2400;
const TOUR_EVERY_MS = 5600;
const QUIET_MS = 3600;

export const useLoomTour = ({
  isActive,
  lastTouch,
  onStep,
  weeks,
}: {
  isActive: boolean;
  lastTouch: RefObject<number>;
  onStep: (week: number | null) => void;
  weeks: readonly number[];
}) => {
  const stepTo = useEffectEvent((week: number | null) => onStep(week));

  useEffect(() => {
    if (!isActive || weeks.length === 0) {
      return;
    }
    let timer = 0;
    let step = 0;
    const later = (delay: number) => {
      timer = window.setTimeout(() => {
        const quiet = performance.now() - lastTouch.current;
        if (quiet < QUIET_MS) {
          later(QUIET_MS - quiet);
          return;
        }
        stepTo(weeks[step] ?? null);
        step = (step + 1) % (weeks.length + 1);
        later(TOUR_EVERY_MS);
      }, delay);
    };
    later(TOUR_FIRST_MS);
    return () => window.clearTimeout(timer);
  }, [isActive, lastTouch, weeks]);
};

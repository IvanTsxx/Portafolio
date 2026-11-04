"use client";

import { useEffect } from "react";

const guideReach = 280;
const guideVariables = ["--guide-x", "--guide-y", "--guide-near"] as const;

const clearGuides = () => {
  for (const guide of document.querySelectorAll<HTMLElement>("[data-guide]")) {
    for (const variable of guideVariables) {
      guide.style.removeProperty(variable);
    }
  }
};

const trackGuides = () => {
  let pointerX = 0;
  let pointerY = 0;
  let isPresent = false;
  let frame = 0;
  let isLit = false;
  const shownNearness = new WeakMap<HTMLElement, number>();

  const paint = () => {
    frame = 0;
    if (!(isPresent || isLit)) {
      return;
    }
    const guides = [
      ...document.querySelectorAll<HTMLElement>("[data-guide]"),
    ].map((guide) => ({ guide, rect: guide.getBoundingClientRect() }));
    isLit = false;
    for (const { guide, rect } of guides) {
      const edgeGap = Math.min(
        Math.abs(pointerX - rect.left),
        Math.abs(pointerX - rect.right)
      );
      const isAlongside = pointerY >= rect.top && pointerY <= rect.bottom;
      const nearness =
        isPresent && isAlongside ? Math.max(0, 1 - edgeGap / guideReach) : 0;
      isLit ||= nearness > 0;
      if (nearness === 0 && shownNearness.get(guide) === 0) {
        continue;
      }
      shownNearness.set(guide, nearness);
      guide.style.setProperty("--guide-x", `${pointerX - rect.left}px`);
      guide.style.setProperty("--guide-y", `${pointerY - rect.top}px`);
      guide.style.setProperty("--guide-near", nearness.toFixed(3));
    }
  };

  const schedule = () => {
    if (frame === 0) {
      frame = requestAnimationFrame(paint);
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      return;
    }
    isPresent = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    schedule();
  };

  const onPointerLeave = () => {
    isPresent = false;
    schedule();
  };

  const root = document.documentElement;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", schedule, { passive: true });
  root.addEventListener("pointerleave", onPointerLeave);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", schedule);
    root.removeEventListener("pointerleave", onPointerLeave);
    clearGuides();
  };
};

export const GuideGlow = () => {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stopTracking: (() => void) | null = null;

    const sync = () => {
      const shouldTrack = finePointer.matches && !reducedMotion.matches;
      if (shouldTrack && !stopTracking) {
        stopTracking = trackGuides();
      } else if (!shouldTrack && stopTracking) {
        stopTracking();
        stopTracking = null;
      }
    };

    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
      stopTracking?.();
    };
  }, []);

  return null;
};

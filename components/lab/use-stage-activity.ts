"use client";

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";

export type StageActivity = "running" | "offscreen" | "reduced";

const activityFor = (
  isReduced: boolean,
  isOnscreen: boolean
): StageActivity => {
  if (isReduced) {
    return "reduced";
  }
  return isOnscreen ? "running" : "offscreen";
};

export const useStageActivity = <Element extends HTMLElement>() => {
  const ref = useRef<Element>(null);
  const [isOnscreen, setIsOnscreen] = useState(false);
  const isReduced = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsOnscreen(entry?.isIntersecting ?? false),
      { rootMargin: "120px 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return {
    activity: activityFor(isReduced, isOnscreen),
    isOnscreen,
    isReduced,
    ref,
  };
};

"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

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
  const isReduced = useReducedMotion();

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

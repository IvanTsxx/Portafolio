"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { RefObject } from "react";

import { useBuildHeld } from "@/components/scene/build-hold";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { createLoomEngine } from "./loom-engine";
import type { LoomSignals } from "./loom-engine";
import type { LoomLayout } from "./loom-layout";
import type { LoomYear } from "./loom-model";
import type { PinField } from "./loom-pins";

const SEEN_SHARE = 0.3;

const useSight = (root: RefObject<HTMLElement | null>) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSeen, setIsSeen] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) {
      return;
    }
    const sight = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        setIsVisible(Boolean(entry?.isIntersecting));
        if (entry && entry.intersectionRatio >= SEEN_SHARE) {
          setIsSeen(true);
        }
      },
      { rootMargin: "120px 0px", threshold: [0, SEEN_SHARE] }
    );
    sight.observe(node);
    return () => sight.disconnect();
  }, [root]);
  return { isSeen, isVisible };
};

export const useLoomMotion = ({
  field,
  initial,
  layout,
  root,
  signals,
  svg,
  years,
}: {
  field: PinField;
  initial: number;
  layout: LoomLayout;
  root: RefObject<HTMLElement | null>;
  signals: LoomSignals;
  svg: RefObject<SVGSVGElement | null>;
  years: readonly LoomYear[];
}) => {
  const isReduced = useReducedMotion();
  const isHeld = useBuildHeld(root);
  const { isSeen, isVisible } = useSight(root);
  const engine = useMemo(
    () => createLoomEngine({ field, initial, layout, years }),
    [field, initial, layout, years]
  );
  const canRun = isVisible && !isHeld && (isSeen || isReduced);

  useLayoutEffect(() => {
    engine.setSignals(signals);
    return () => engine.setSignals(null);
  });

  useLayoutEffect(() => {
    engine.mount(root.current, svg.current);
    return engine.prepare(isReduced);
  }, [engine, isReduced, root, svg]);

  useEffect(() => {
    engine.setRunnable(canRun);
  }, [engine, canRun]);

  useEffect(() => () => engine.stop(), [engine]);

  return { engine, isReduced, isVisible };
};

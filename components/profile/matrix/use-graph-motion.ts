"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useBuildHeld } from "@/components/scene/build-hold";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motionKit } from "@/lib/motion/gsap";

const { gsap, useGSAP } = motionKit;

export type GraphPhase = "waiting" | "typing" | "settled";

const seenShare = 0.3;
const firstColumnStep = 0.014;
const switchColumnStep = 0.006;
const keyDuration = 0.3;
const pulseStep = 0.07;
const pulseRest = 3.4;

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
        if (entry && entry.intersectionRatio >= seenShare) {
          setIsSeen(true);
        }
      },
      { threshold: [0, seenShare] }
    );
    sight.observe(node);
    return () => sight.disconnect();
  }, [root]);
  return { isSeen, isVisible };
};

const weekOf = (element: Element) =>
  element instanceof HTMLElement ? Number(element.dataset.week ?? 0) : 0;

export const useGraphMotion = ({
  grid,
  latestWeek,
  root,
  yearKey,
}: {
  grid: RefObject<HTMLElement | null>;
  latestWeek: number;
  root: RefObject<HTMLElement | null>;
  yearKey: number;
}) => {
  const isReduced = useReducedMotion();
  const isHeld = useBuildHeld(root);
  const { isSeen, isVisible } = useSight(root);
  const [phase, setPhase] = useState<GraphPhase>("waiting");
  const hasTyped = useRef(false);
  const canType = isSeen && !isHeld;

  useGSAP(
    (_context, contextSafe) => {
      const cells = grid.current?.querySelectorAll<HTMLElement>("[data-cell]");
      if (!(cells && contextSafe) || isReduced) {
        return;
      }
      if (!canType) {
        gsap.set(cells, { opacity: 0 });
        return;
      }
      const step = hasTyped.current ? switchColumnStep : firstColumnStep;
      hasTyped.current = true;
      setPhase("typing");
      gsap.fromTo(
        cells,
        { opacity: 0, scale: 0.6 },
        {
          duration: keyDuration,
          ease: "power3.out",
          onComplete: contextSafe(() => setPhase("settled")),
          opacity: 1,
          scale: 1,
          stagger: (_index, cell: Element) => weekOf(cell) * step,
        }
      );
    },
    {
      dependencies: [canType, isReduced, yearKey],
      revertOnUpdate: true,
      scope: grid,
    }
  );

  const canPulse = phase === "settled" && isVisible && !isReduced;

  useGSAP(
    () => {
      const fills = grid.current?.querySelectorAll<HTMLElement>(
        `[data-week="${latestWeek}"] [data-fill]`
      );
      if (!(fills && fills.length > 0 && canPulse)) {
        return;
      }
      gsap
        .timeline({ delay: 1, repeat: -1, repeatDelay: pulseRest })
        .to(fills, {
          duration: 0.16,
          ease: "power2.out",
          scale: 0.55,
          stagger: pulseStep,
        })
        .to(
          fills,
          {
            duration: 0.34,
            ease: "power3.out",
            scale: 1,
            stagger: pulseStep,
          },
          0.16
        );
    },
    {
      dependencies: [canPulse, latestWeek, yearKey],
      revertOnUpdate: true,
      scope: grid,
    }
  );

  return { isReduced, phase: isReduced ? "settled" : phase };
};

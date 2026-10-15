"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";

import { useBuildHeld } from "@/components/scene/build-hold";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type StepStyle = CSSProperties & { "--step": string };

const unsubscribe = () => null;

const subscribeNever = () => unsubscribe;

const useIsClient = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

export const TypeOnView = ({
  children,
  className,
  stepMs,
}: {
  children: ReactNode;
  className?: string;
  stepMs: number;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const isClient = useIsClient();
  const isReduced = useReducedMotion();
  const isHeld = useBuildHeld(root);

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const sight = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          sight.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    sight.observe(element);
    return () => sight.disconnect();
  }, []);

  const playback = isInView && !isHeld ? "playing" : "armed";
  const style: StepStyle = { "--step": `${stepMs}ms` };

  return (
    <div
      className={className}
      data-build-block
      data-typing={!isClient || isReduced ? "idle" : playback}
      ref={root}
      style={style}
    >
      {children}
    </div>
  );
};

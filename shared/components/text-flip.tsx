"use client";

import { atom, useAtom } from "jotai";
import type { Transition, Variants } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import { Children, useEffect } from "react";

import { cn } from "@/shared/lib/utils";

export const flipIndexAtom = atom(0);

const defaultVariants: Variants = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  initial: { opacity: 0, y: -8 },
};

type MotionElement = typeof motion.p | typeof motion.span | typeof motion.code;

export interface TextFlipProps {
  as?: MotionElement;
  className?: string;
  children: React.ReactNode[];
  interval?: number;
  transition?: Transition;
  variants?: Variants;
}

export function TextFlip({
  as: Component = motion.p,
  className,
  children,
  interval = 2,
  transition = { duration: 0.3 },
  variants = defaultVariants,
}: TextFlipProps) {
  const [currentIndex, setCurrentIndex] = useAtom(flipIndexAtom);

  const items = Children.toArray(children);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [items.length, interval, setCurrentIndex]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Component
        key={currentIndex}
        className={cn("inline-block", className)}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        variants={variants}
      >
        {items[currentIndex]}
      </Component>
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

import type { EdgePress } from "./edge-press";

const followShare = 0.32;
const settleDistance = 0.4;

const lensClassName =
  "ease-out-quart pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden opacity-0 mask-y-from-60% transition-opacity duration-200 group-hover/edge:opacity-100 motion-reduce:transition-none";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const along = (offset: number) => `translate3d(0, ${offset}px, 0)`;

const pointerAt = (event: PointerEvent<HTMLDivElement>) =>
  event.clientY - event.currentTarget.getBoundingClientRect().top;

export const EdgeStrip = ({
  base,
  lit,
  onPress,
}: {
  base: ReactNode;
  lit: ReactNode;
  onPress: (press: EdgePress) => void;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const lensContent = useRef<HTMLDivElement>(null);
  const marks = useRef<HTMLDivElement>(null);
  const follow = useRef({ current: 0, frame: 0, target: 0 });

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const measure = () => {
      element.style.setProperty(
        "--edge-length",
        `${element.getBoundingClientRect().height}px`
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const state = follow.current;
    return () => {
      observer.disconnect();
      cancelAnimationFrame(state.frame);
    };
  }, []);

  const paint = () => {
    const state = follow.current;
    const lensElement = lens.current;
    if (!lensElement) {
      return;
    }
    const half = lensElement.offsetHeight / 2;
    lensElement.style.transform = along(state.current - half);
    lensContent.current?.style.setProperty(
      "transform",
      along(half - state.current)
    );
  };

  const step = () => {
    const state = follow.current;
    state.frame = 0;
    const gap = state.target - state.current;
    state.current =
      Math.abs(gap) < settleDistance || prefersReducedMotion()
        ? state.target
        : state.current + gap * followShare;
    paint();
    if (state.current !== state.target) {
      state.frame = requestAnimationFrame(step);
    }
  };

  return (
    <div
      aria-hidden
      className="group/edge absolute inset-y-4 left-0 z-20 hidden w-12 cursor-pointer touch-manipulation select-none md:block"
      onPointerDown={(event) => {
        if (event.button !== 0 || !lens.current || !marks.current) {
          return;
        }
        const at = pointerAt(event);
        follow.current.target = at;
        follow.current.current = at;
        paint();
        onPress({
          at,
          lens: lens.current,
          marks: marks.current,
          reduced: prefersReducedMotion(),
        });
      }}
      onPointerEnter={(event) => {
        const at = pointerAt(event);
        follow.current.target = at;
        follow.current.current = at;
        paint();
      }}
      onPointerMove={(event) => {
        follow.current.target = pointerAt(event);
        if (follow.current.frame === 0) {
          follow.current.frame = requestAnimationFrame(step);
        }
      }}
      ref={root}
    >
      {base}
      <div className={lensClassName} ref={lens}>
        <div
          className="absolute inset-x-0 top-0 h-(--edge-length)"
          ref={lensContent}
        >
          {lit}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0" ref={marks} />
    </div>
  );
};

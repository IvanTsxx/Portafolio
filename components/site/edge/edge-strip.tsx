"use client";

import { cva } from "class-variance-authority";
import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { EdgeAxis, EdgePress } from "./edge-press";

const followShare = 0.32;
const settleDistance = 0.4;

const lensVariants = cva(
  "ease-out-quart pointer-events-none absolute top-0 left-0 overflow-hidden opacity-0 transition-opacity duration-200 group-hover/edge:opacity-100 motion-reduce:transition-none",
  {
    variants: {
      axis: {
        x: "inset-y-0 w-40 mask-x-from-60%",
        y: "inset-x-0 h-40 mask-y-from-60%",
      },
    },
  }
);

const lensContentVariants = cva("absolute top-0 left-0", {
  variants: {
    axis: {
      x: "inset-y-0 w-(--edge-length)",
      y: "inset-x-0 h-(--edge-length)",
    },
  },
});

const readoutClassName =
  "label text-ink ease-out-quart pointer-events-none absolute top-0 left-0 tabular-nums opacity-0 transition-opacity duration-200 group-hover/edge:opacity-100 motion-reduce:transition-none";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const along = (axis: EdgeAxis, offset: number) =>
  axis === "y"
    ? `translate3d(0, ${offset}px, 0)`
    : `translate3d(${offset}px, 0, 0)`;

export const EdgeStrip = ({
  axis,
  base,
  className,
  lit,
  onPress,
  readout,
}: {
  axis: EdgeAxis;
  base: ReactNode;
  className: string;
  lit: ReactNode;
  onPress: (press: EdgePress) => void;
  readout?: (at: number) => string;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const lensContent = useRef<HTMLDivElement>(null);
  const readoutLabel = useRef<HTMLSpanElement>(null);
  const marks = useRef<HTMLDivElement>(null);
  const follow = useRef({ current: 0, frame: 0, target: 0 });

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const measure = () => {
      const box = element.getBoundingClientRect();
      element.style.setProperty(
        "--edge-length",
        `${axis === "y" ? box.height : box.width}px`
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
  }, [axis]);

  const paint = () => {
    const state = follow.current;
    const lensElement = lens.current;
    if (!lensElement) {
      return;
    }
    const half =
      (axis === "y" ? lensElement.offsetHeight : lensElement.offsetWidth) / 2;
    lensElement.style.transform = along(axis, state.current - half);
    lensContent.current?.style.setProperty(
      "transform",
      along(axis, half - state.current)
    );
    if (readoutLabel.current && readout) {
      readoutLabel.current.style.transform = `${along(axis, state.current)} translateX(-50%)`;
      readoutLabel.current.textContent = readout(state.current);
    }
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

  const pointerAt = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return axis === "y" ? event.clientY - box.top : event.clientX - box.left;
  };

  return (
    <div
      aria-hidden
      className={cn(
        "group/edge absolute touch-manipulation select-none",
        className
      )}
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
          axis,
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
      <div className={lensVariants({ axis })} ref={lens}>
        <div className={lensContentVariants({ axis })} ref={lensContent}>
          {lit}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0" ref={marks} />
      {readout ? (
        <span className={readoutClassName} ref={readoutLabel} />
      ) : null}
    </div>
  );
};

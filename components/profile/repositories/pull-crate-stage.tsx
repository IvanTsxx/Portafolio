"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { crateHeight, sleevePose } from "./crate-pose";
import type { RackItem } from "./panel-stack";
import { PullReveals } from "./pull-rack";
import { usePull } from "./use-pull";

const SPIN_MS = 12_000;
const SETTLE_MS = 400;
const PULLED_OPACITY = 0.2;

const pulledPose = (
  index: number,
  active: number,
  open: number | null,
  isReduced: boolean
): CSSProperties => {
  const pose = sleevePose(index, active);
  if (index !== open) {
    return pose;
  }
  return {
    ...pose,
    opacity: PULLED_OPACITY,
    transform: isReduced
      ? pose.transform
      : `${pose.transform} translate3d(0, -40%, 0)`,
  };
};

const useSpin = (
  root: RefObject<HTMLElement | null>,
  open: number | null,
  isReduced: boolean
) => {
  useEffect(() => {
    const disc = root.current?.querySelector(`[data-spin="${open}"]`);
    if (!disc || open === null || isReduced) {
      return;
    }
    const spin = disc.animate([{ rotate: "0deg" }, { rotate: "360deg" }], {
      duration: SPIN_MS,
      iterations: Number.POSITIVE_INFINITY,
    });
    const sight = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        spin.play();
      } else {
        spin.pause();
      }
    });
    sight.observe(disc);
    return () => {
      sight.disconnect();
      spin.pause();
      window.setTimeout(() => spin.cancel(), SETTLE_MS);
    };
  }, [root, open, isReduced]);
};

export const PullCrateStage = ({
  arm,
  band,
  deck,
  panels,
  sleeves,
}: {
  arm: ReactNode;
  band: ReactNode;
  deck: ReactNode;
  panels: readonly RackItem[];
  sleeves: readonly RackItem[];
}) => {
  const root = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();
  const { active, open } = usePull(root, sleeves.length - 1);
  useSpin(root, open, isReduced);

  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-8"
      ref={root}
    >
      <div
        className="@container w-full max-w-80 shrink-0 lg:max-w-72"
        data-build-block
      >
        <div
          className="relative overflow-clip"
          style={crateHeight(sleeves.length)}
        >
          <ul
            aria-label="Pinned repositories as records in a crate. Arrow keys flip, Enter pulls one out."
            className="absolute inset-0"
          >
            {sleeves.map(({ id, node }, index) => (
              <li
                className="ease-out-quart absolute inset-x-3 top-0 aspect-square transition-[transform,opacity] duration-300 motion-reduce:transition-opacity"
                key={id}
                style={pulledPose(index, active ?? 0, open, isReduced)}
              >
                {node}
              </li>
            ))}
          </ul>
          <div
            aria-hidden
            className="border-ink bg-paper-deep absolute inset-x-0 bottom-0 z-50 flex h-12 items-center justify-between gap-4 border-x border-t-2 border-b px-3"
          >
            {band}
          </div>
        </div>
      </div>
      <PullReveals
        className="min-w-0 lg:flex-1"
        label="Record on the turntable"
        open={open}
        over={arm}
        panels={panels}
        shown={open}
        under={deck}
      />
    </div>
  );
};

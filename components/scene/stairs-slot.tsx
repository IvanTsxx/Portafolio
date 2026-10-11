"use client";

import { lazy, useId, useRef } from "react";
import type { ReactNode } from "react";

import type { Stair } from "@/components/profile/experience-stairs/stairs-model";
import { cn } from "@/lib/utils";

import { useAgentCast, useViewSlot } from "./view-registry";

const StairsContent = lazy(() => import("./stairs-content"));

export interface StairsSlotProps {
  activeIndex: number;
  children?: ReactNode;
  className?: string;
  enabled: boolean;
  highlightIndex: number | null;
  isReduced: boolean;
  label: string;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  stairs: readonly Stair[];
}

export const StairsSlot = ({
  activeIndex,
  children,
  className,
  enabled,
  highlightIndex,
  isReduced,
  label,
  onHover,
  onSelect,
  stairs,
}: StairsSlotProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();

  useViewSlot(
    id,
    track,
    <StairsContent
      activeIndex={activeIndex}
      highlightIndex={highlightIndex}
      isReduced={isReduced}
      onHover={onHover}
      onSelect={onSelect}
      stairs={stairs}
      track={track}
    />,
    enabled
  );
  useAgentCast(track, enabled);

  return (
    <figure
      aria-label={label}
      className={cn("relative m-0", className)}
      data-stairs-step={activeIndex}
      onPointerLeave={() => onHover(null)}
      ref={track}
    >
      {children}
    </figure>
  );
};

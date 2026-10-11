"use client";

import { lazy, useId, useRef } from "react";
import type { ReactNode, RefObject } from "react";

import type { Timeline } from "@/lib/timeline/timeline";
import { cn } from "@/lib/utils";

import { useAgentCast, useViewSlot } from "./view-registry";

const TimelineContent = lazy(() => import("./timeline-content"));

export type TimelineMode = "scrub" | "static";

export interface TimelineScrub {
  progress: number;
}

export interface TimelineSlotProps {
  activeId: string | null;
  card: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
  className?: string;
  enabled: boolean;
  label: string;
  mode: TimelineMode;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  scrub: RefObject<TimelineScrub>;
  timeline: Timeline;
}

export const TimelineSlot = ({
  activeId,
  card,
  children,
  className,
  enabled,
  label,
  mode,
  onHover,
  onSelect,
  scrub,
  timeline,
}: TimelineSlotProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();

  useViewSlot(
    id,
    track,
    <TimelineContent
      activeId={activeId}
      card={card}
      mode={mode}
      onHover={onHover}
      onSelect={onSelect}
      scrub={scrub}
      timeline={timeline}
    />,
    enabled
  );
  useAgentCast(track, enabled);

  return (
    <figure
      aria-label={label}
      className={cn("relative m-0", className)}
      data-timeline-stage={mode}
      ref={track}
    >
      {children}
    </figure>
  );
};

"use client";

import { lazy, useId, useRef } from "react";
import type { ReactNode } from "react";

import type { ShelfBook } from "@/components/profile/repo-shelf/shelf-model";
import { cn } from "@/lib/utils";

import { useAgentCast, useViewSlot } from "./view-registry";

const ShelfContent = lazy(() => import("./shelf-content"));

export interface ShelfSlotProps {
  activeId: string | null;
  books: readonly ShelfBook[];
  children?: ReactNode;
  className?: string;
  enabled: boolean;
  isReduced: boolean;
  label: string;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

export const ShelfSlot = ({
  activeId,
  books,
  children,
  className,
  enabled,
  isReduced,
  label,
  onHover,
  onSelect,
}: ShelfSlotProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();

  useViewSlot(
    id,
    track,
    <ShelfContent
      activeId={activeId}
      books={books}
      isReduced={isReduced}
      onHover={onHover}
      onSelect={onSelect}
      track={track}
    />,
    enabled
  );
  useAgentCast(track, enabled);

  return (
    <figure
      aria-label={label}
      data-build-block
      className={cn("relative m-0", className)}
      data-shelf-active={activeId ?? undefined}
      onPointerLeave={() => onHover(null)}
      ref={track}
    >
      {children}
    </figure>
  );
};

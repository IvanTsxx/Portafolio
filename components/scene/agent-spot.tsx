"use client";

import { cva } from "class-variance-authority";
import { lazy, useId, useRef, useSyncExternalStore } from "react";

import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { agentProfiles } from "@/lib/agents/roles";
import type { AgentSpotEdge } from "@/lib/agents/scenes";
import { cn } from "@/lib/utils";

import { useViewSlot } from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const AgentSpotContent = lazy(() => import("./agent-spot-content"));

export interface AgentSpotProps {
  role: AgentRole;
  action?: AgentAction;
  edge: AgentSpotEdge;
  align?: "start" | "center" | "end";
  size?: "xs" | "sm";
  className?: string;
}

const spotVariants = cva("pointer-events-none absolute z-10 block", {
  compoundVariants: [
    { align: "start", axis: "horizontal", className: "left-4" },
    {
      align: "center",
      axis: "horizontal",
      className: "left-1/2 -translate-x-1/2",
    },
    { align: "end", axis: "horizontal", className: "right-4" },
    { align: "start", axis: "vertical", className: "top-4" },
    {
      align: "center",
      axis: "vertical",
      className: "top-1/2 -translate-y-1/2",
    },
    { align: "end", axis: "vertical", className: "bottom-4" },
    { axis: "horizontal", className: "h-20 w-24", size: "sm" },
    { axis: "horizontal", className: "h-14 w-16", size: "xs" },
    { axis: "vertical", className: "h-24 w-20", size: "sm" },
    { axis: "vertical", className: "h-16 w-14", size: "xs" },
  ],
  variants: {
    align: { center: "", end: "", start: "" },
    axis: { horizontal: "", vertical: "" },
    edge: {
      bottom: "top-full",
      left: "right-full",
      right: "left-full",
      top: "bottom-full",
    },
    size: { sm: "", xs: "" },
  },
});

const compactQuery = "(max-width: 639px)";

const subscribeCompact = (onChange: () => void) => {
  const query = window.matchMedia(compactQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getCompact = () => window.matchMedia(compactQuery).matches;
const getServerCompact = () => false;

const resolveEdge = (edge: AgentSpotEdge, isCompact: boolean) =>
  isCompact && (edge === "left" || edge === "right") ? "top" : edge;

export const AgentSpot = ({
  role,
  action,
  edge,
  align = "end",
  size = "sm",
  className,
}: AgentSpotProps) => {
  const track = useRef<HTMLSpanElement>(null);
  const id = useId();
  const hasWebGL = useWebGLSupport();
  const isCompact = useSyncExternalStore(
    subscribeCompact,
    getCompact,
    getServerCompact
  );
  const placedEdge = resolveEdge(edge, isCompact);
  const resolvedAction = action ?? agentProfiles[role].signatureActions[0];

  useViewSlot(
    id,
    track,
    <AgentSpotContent action={resolvedAction} edge={placedEdge} role={role} />,
    hasWebGL
  );

  return (
    <span
      aria-hidden
      className={cn(
        spotVariants({
          align,
          axis:
            placedEdge === "top" || placedEdge === "bottom"
              ? "horizontal"
              : "vertical",
          edge: placedEdge,
          size,
        }),
        className
      )}
      data-agent-action={resolvedAction}
      data-agent-align={align}
      data-agent-edge={placedEdge}
      data-agent-role={role}
      data-agent-size={size}
      ref={track}
    >
      {hasWebGL ? null : (
        <span className="bg-clay absolute bottom-1 left-1/2 size-2 -translate-x-1/2" />
      )}
    </span>
  );
};

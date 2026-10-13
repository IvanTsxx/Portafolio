"use client";

import { lazy, useId, useRef } from "react";
import type { ReactNode } from "react";

import type { Outfit } from "@/components/agents/outfit";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { cn } from "@/lib/utils";

import { StageFallback } from "./stage-fallback";
import { useAgentCast, useViewSlot } from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const AgentStageContent = lazy(() => import("./agent-stage-content"));

export interface AgentStageSlotProps {
  action?: AgentAction;
  children?: ReactNode;
  className?: string;
  label: string;
  outfit?: Outfit;
  role: AgentRole;
}

export const AgentStageSlot = ({
  action = "idle",
  children,
  className,
  label,
  outfit,
  role,
}: AgentStageSlotProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();
  const hasWebGL = useWebGLSupport();

  useViewSlot(
    id,
    track,
    <AgentStageContent action={action} outfit={outfit} role={role} />,
    hasWebGL
  );
  useAgentCast(track, hasWebGL);

  return (
    <figure
      aria-label={label}
      data-build-block
      className={cn("relative m-0", className)}
      data-agent-stage={role}
      ref={track}
    >
      {hasWebGL ? null : (
        <StageFallback className="absolute inset-0" label={label} />
      )}
      {children}
    </figure>
  );
};

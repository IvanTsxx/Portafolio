"use client";

import { lazy, useId, useRef } from "react";

import type { AgentSceneId } from "@/lib/agents/scenes";
import { cn } from "@/lib/utils";

import { StageFallback } from "./stage-fallback";
import { useAgentCast, useViewSlot } from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const AgentSceneContent = lazy(() => import("./agent-scene-content"));

export interface AgentSceneProps {
  scene: AgentSceneId;
  label: string;
  className?: string;
}

export const AgentScene = ({ scene, label, className }: AgentSceneProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();
  const hasWebGL = useWebGLSupport();

  useViewSlot(id, track, <AgentSceneContent scene={scene} />, hasWebGL);
  useAgentCast(track, hasWebGL);

  return (
    <figure
      aria-label={label}
      className={cn("relative m-0 aspect-4/3 w-full", className)}
      data-agent-scene={scene}
      ref={track}
    >
      {hasWebGL ? null : (
        <StageFallback className="absolute inset-0" label={label} />
      )}
    </figure>
  );
};

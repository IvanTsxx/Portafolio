"use client";

import { useId, useRef } from "react";

import { useViewSlot } from "@/components/scene/view-registry";
import { useWebGLSupport } from "@/components/scene/webgl-support";
import { cn } from "@/lib/utils";
import { AgentPoster } from "@/registry/ivan/components/agent-stage/agent-poster";
import type { AgentStageProps } from "@/registry/ivan/components/agent-stage/agent-stage";
import { AgentStageScene } from "@/registry/ivan/components/agent-stage/agent-stage-scene";
import { agentRoleLabels } from "@/registry/ivan/components/agent/types";

export const AgentStage = ({
  role,
  action,
  motion,
  shadow,
  label,
  fallback,
  className,
}: AgentStageProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();
  const hasWebGL = useWebGLSupport();

  useViewSlot(
    id,
    track,
    <AgentStageScene
      action={action}
      motion={motion}
      role={role}
      shadow={shadow}
    />,
    hasWebGL
  );

  return (
    <figure
      aria-label={label ?? agentRoleLabels[role]}
      className={cn("relative m-0 aspect-4/3 w-full", className)}
      ref={track}
    >
      {hasWebGL
        ? null
        : (fallback ?? <AgentPoster className="size-full" role={role} />)}
    </figure>
  );
};

"use client";

import { lazy, useId, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

import type { StageId } from "@/lib/agents/stages";
import { cn } from "@/lib/utils";

import {
  forgetStageCue,
  readStageCue,
  registerCompanionStage,
} from "./companion-stages";
import { StageFallback } from "./stage-fallback";
import { useViewSlot } from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const StageSceneContent = lazy(() => import("./stage-scene-content"));

export interface StageSceneProps {
  children?: ReactNode;
  className?: string;
  label: string;
  stage: StageId;
}

export const StageScene = ({
  children,
  className,
  label,
  stage,
}: StageSceneProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();
  const cueId = `${id}${stage}`;
  const hasWebGL = useWebGLSupport();

  useViewSlot(
    id,
    track,
    <StageSceneContent cueId={cueId} stage={stage} />,
    hasWebGL
  );

  useLayoutEffect(() => {
    const figure = track.current;
    if (!(figure && hasWebGL)) {
      return;
    }
    const release = registerCompanionStage({
      figure,
      id: cueId,
      isFeatured: true,
      spot: () => {
        const cue = readStageCue(cueId);
        if (!cue) {
          return null;
        }
        const box = figure.getBoundingClientRect();
        return {
          action: cue.action,
          height: cue.height * box.height,
          x: box.left + cue.x * box.width,
          y: box.top + cue.y * box.height,
          yaw: cue.yaw,
        };
      },
    });
    return () => {
      release();
      forgetStageCue(cueId);
    };
  }, [cueId, hasWebGL]);

  return (
    <figure
      aria-label={label}
      className={cn("relative m-0 w-full", className)}
      data-build-block
      data-stage={stage}
      ref={track}
    >
      {hasWebGL ? null : (
        <StageFallback className="absolute inset-0" label={label} />
      )}
      {children}
    </figure>
  );
};

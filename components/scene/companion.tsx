"use client";

import { lazy, useRef } from "react";
import type { PointerEvent } from "react";

import type { AgentPointer } from "@/components/agents/use-agent-rig";

import { useHasWaypoints, useViewSlot, viewPriority } from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const CompanionContent = lazy(() => import("./companion-content"));

const companionSlotId = "agent-companion";

const CompanionStage = () => {
  const stage = useRef<HTMLDivElement>(null);
  const hit = useRef<HTMLDivElement>(null);
  const pointer = useRef<AgentPointer>({ hovered: false, x: 0, y: 0 });

  useViewSlot(
    companionSlotId,
    stage,
    <CompanionContent hit={hit} pointer={pointer} />,
    true,
    viewPriority.overlay
  );

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - box.left) / box.width) * 2 - 1;
    pointer.current.y = 1 - ((event.clientY - box.top) / box.height) * 2;
  };

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        data-agent-companion=""
        ref={stage}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-30 size-0 cursor-pointer touch-manipulation"
        data-agent-companion-hit=""
        onPointerEnter={(event) => {
          trackPointer(event);
          pointer.current.hovered = true;
        }}
        onPointerLeave={() => {
          pointer.current.hovered = false;
        }}
        onPointerMove={trackPointer}
        ref={hit}
      />
    </>
  );
};

export const Companion = () => {
  const hasWaypoints = useHasWaypoints();
  const hasWebGL = useWebGLSupport();
  return hasWaypoints && hasWebGL ? <CompanionStage /> : null;
};

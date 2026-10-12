"use client";

import { lazy, useRef } from "react";
import type { PointerEvent, RefObject } from "react";

import type { AgentPointer } from "@/components/agents/use-agent-rig";

import { notifyCompanionActivate, useCompanionLine } from "./companion-signals";
import {
  requestSceneFrame,
  useHasWaypoints,
  useViewSlot,
  viewPriority,
} from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const CompanionContent = lazy(() => import("./companion-content"));

const companionSlotId = "agent-companion";

const SpeechBubble = ({
  bubble,
}: {
  bubble: RefObject<HTMLDivElement | null>;
}) => {
  const line = useCompanionLine();
  return (
    <div
      className="group/speech pointer-events-none fixed top-0 left-0 z-30 size-0"
      data-agent-speech=""
      data-shown="false"
      data-side="left"
      ref={bubble}
    >
      <p
        aria-atomic
        aria-live="polite"
        className="border-ink bg-paper text-ink ease-out-quart before:bg-ink absolute bottom-0 m-0 w-max max-w-64 translate-y-1 border px-3 py-2 font-mono text-xs leading-snug text-pretty opacity-0 transition-[opacity,translate] duration-200 select-none group-data-[shown=true]/speech:translate-y-0 group-data-[shown=true]/speech:opacity-100 group-data-[side=left]/speech:right-0 group-data-[side=right]/speech:left-0 before:absolute before:-bottom-2 before:h-2 before:w-px group-data-[side=left]/speech:before:right-4 group-data-[side=right]/speech:before:left-4"
      >
        {line ? (
          <>
            <span aria-hidden className="text-mist">
              ›{" "}
            </span>
            {line}
          </>
        ) : null}
      </p>
    </div>
  );
};

const CompanionStage = () => {
  const stage = useRef<HTMLDivElement>(null);
  const hit = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const pointer = useRef<AgentPointer>({
    hovered: false,
    presses: 0,
    x: 0,
    y: 0,
  });
  const presses = useRef(0);

  useViewSlot(
    companionSlotId,
    stage,
    <CompanionContent
      bubble={bubble}
      hit={hit}
      pointer={pointer}
      presses={presses}
    />,
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
      <SpeechBubble bubble={bubble} />
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-30 size-0 cursor-pointer touch-manipulation"
        data-agent-companion-hit=""
        onClick={() => {
          presses.current += 1;
          requestSceneFrame();
          notifyCompanionActivate();
        }}
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

"use client";

import { usePathname } from "next/navigation";
import {
  lazy,
  useEffect,
  useEffectEvent,
  useRef,
  useSyncExternalStore,
} from "react";
import type { PointerEvent, RefObject } from "react";

import type { AgentPointer } from "@/components/agents/use-agent-rig";
import { companionCastFor, showcasesTheRig } from "@/lib/site/companion-roles";

import type { ColumnBounds } from "./companion-placement";
import { notifyCompanionActivate, useCompanionLine } from "./companion-signals";
import { useCompanionWardrobe } from "./companion-wardrobe";
import { StationTracker } from "./station-tracker";
import { requestSceneFrame, useViewSlot, viewPriority } from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const CompanionContent = lazy(() => import("./companion-content"));

const companionSlotId = "agent-companion";
const subscribeToLoad = (onChange: () => void) => {
  window.addEventListener("load", onChange);
  return () => window.removeEventListener("load", onChange);
};
const isClient = () => true;
const isServer = () => false;
const readingColumnSelector = "[data-reading-column]";

const measureColumn = (element: HTMLElement): ColumnBounds => {
  const box = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    left: box.left + Number(style.paddingLeft.slice(0, -2)),
    right: box.right - Number(style.paddingRight.slice(0, -2)),
  };
};

const ReadingColumnProbe = ({
  onMeasure,
}: {
  onMeasure: (bounds: ColumnBounds | null) => void;
}) => {
  const report = useEffectEvent(onMeasure);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(readingColumnSelector);
    if (!element) {
      report(null);
      return;
    }
    const measure = () => {
      report(measureColumn(element));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(document.documentElement);
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};

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
      data-side="above"
      data-tail="true"
      ref={bubble}
    >
      <p
        aria-atomic
        aria-live="polite"
        className="border-ink bg-paper text-ink ease-out-quart before:bg-ink absolute bottom-0 left-0 m-0 w-max max-w-(--speech-width) translate-y-1 border px-2.5 py-1.5 font-mono text-xs/snug text-pretty opacity-0 transition-[opacity,translate] duration-200 select-none group-data-[shown=true]/speech:translate-y-0 group-data-[shown=true]/speech:opacity-100 group-data-[side=below]/speech:top-0 group-data-[side=below]/speech:bottom-auto before:absolute before:-bottom-2 before:left-(--speech-tail) before:h-2 before:w-px group-data-[side=below]/speech:before:-top-2 group-data-[side=below]/speech:before:bottom-auto group-data-[tail=false]/speech:before:hidden motion-reduce:transition-opacity"
      >
        {line ? (
          <>
            <span aria-hidden className="text-mist">
              ›{" "}
            </span>
            {line.isQuiet ? <span aria-hidden>{line.text}</span> : line.text}
          </>
        ) : null}
      </p>
    </div>
  );
};

const CompanionStage = () => {
  const pathname = usePathname();
  const cast = companionCastFor(pathname);
  const column = useRef<ColumnBounds | null>(null);
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
  const wardrobe = useCompanionWardrobe();
  const isHydrated = useSyncExternalStore(subscribeToLoad, isClient, isServer);

  useViewSlot(
    companionSlotId,
    stage,
    <CompanionContent
      bubble={bubble}
      cast={cast}
      column={column}
      hit={hit}
      pointer={pointer}
      presses={presses}
      wardrobe={wardrobe}
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
      <ReadingColumnProbe
        key={pathname}
        onMeasure={(bounds) => {
          column.current = bounds;
          requestSceneFrame();
        }}
      />
      {isHydrated ? <StationTracker /> : null}
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
  const hasWebGL = useWebGLSupport();
  const isShowcase = showcasesTheRig(usePathname());
  return hasWebGL && !isShowcase ? <CompanionStage /> : null;
};

"use client";

import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { TimelineSlot } from "@/components/scene/timeline-slot";
import type { TimelineScrub } from "@/components/scene/timeline-slot";
import { requestSceneFrame } from "@/components/scene/view-registry";
import { useWebGLSupport } from "@/components/scene/webgl-support";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motionKit } from "@/lib/motion/gsap";
import type { Timeline, TimelineEntry } from "@/lib/timeline/timeline";
import { startOfEntry } from "@/lib/timeline/timeline";
import { cn } from "@/lib/utils";

import { TimelineCard } from "./timeline-card";
import { TimelineIndex } from "./timeline-index";
import { TimelineRail } from "./timeline-rail";

const desktopQuery = "(min-width: 64rem)";
const pinTopPixels = 64;
const stageCardId = "timeline-card-stage";
const railCardId = "timeline-card-rail";

const subscribeDesktop = (onChange: () => void) => {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const useIsDesktop = () =>
  useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(desktopQuery).matches,
    () => false
  );

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const TimelineStage = ({ timeline }: { timeline: Timeline }) => {
  const isDesktop = useIsDesktop();
  const hasWebGL = useWebGLSupport();
  const isReduced = useReducedMotion();
  const isStaged = isDesktop && hasWebGL;
  const isScrubbing = isStaged && !isReduced;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrub = useRef<TimelineScrub>({ progress: 0 });
  const wrapper = useRef<HTMLDivElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);

  const activeId = hoverId ?? selectedId;
  const active = timeline.entries.find((entry) => entry.id === activeId);
  const selected = timeline.entries.find((entry) => entry.id === selectedId);
  const toggleSelected = (id: string) =>
    setSelectedId((current) => (current === id ? null : id));

  motionKit.useGSAP(
    () => {
      const wrapperElement = wrapper.current;
      const pinnedElement = pinned.current;
      if (!(isScrubbing && wrapperElement && pinnedElement)) {
        trigger.current = null;
        return;
      }
      trigger.current = motionKit.ScrollTrigger.create({
        end: () =>
          `+=${Math.max(1, wrapperElement.offsetHeight - pinnedElement.offsetHeight)}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrub.current.progress = self.progress;
          requestSceneFrame();
        },
        start: `top ${pinTopPixels}px`,
        trigger: wrapperElement,
      });
      scrub.current.progress = trigger.current.progress;
    },
    { dependencies: [isScrubbing], revertOnUpdate: true }
  );

  const revealEntry = (entry: TimelineEntry) => {
    const scroll = trigger.current;
    if (!scroll) {
      return;
    }
    const progress = clamp01(
      (startOfEntry(entry) - timeline.range.from) /
        (timeline.now.at - timeline.range.from)
    );
    window.scrollTo({
      behavior: "smooth",
      top: scroll.start + (scroll.end - scroll.start) * progress,
    });
  };

  useEffect(() => {
    if (!(selectedId || hoverId)) {
      return;
    }
    const dismiss = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId(null);
        setHoverId(null);
      }
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [hoverId, selectedId]);

  return (
    <div
      className={cn(
        "relative",
        hasWebGL && "lg:motion-safe:h-[calc(min(36rem,100svh-6rem)+110svh)]"
      )}
      ref={wrapper}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          hasWebGL &&
            "lg:sticky lg:top-16 lg:z-40 lg:h-[min(36rem,100svh-6rem)] lg:motion-reduce:h-88"
        )}
        ref={pinned}
      >
        {hasWebGL ? (
          <>
            <TimelineSlot
              activeId={activeId}
              card={card}
              className="border-rule hidden min-h-0 flex-1 border lg:block"
              enabled={isStaged}
              label="Timeline of roles and pinned repositories, left to right by date"
              mode={isScrubbing ? "scrub" : "static"}
              onHover={setHoverId}
              onSelect={toggleSelected}
              scrub={scrub}
              timeline={timeline}
            >
              <div
                aria-live="polite"
                className={cn(
                  "absolute top-0 left-0",
                  selected && active === selected
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                )}
                hidden={!active}
                id={stageCardId}
                ref={card}
              >
                {active ? (
                  <TimelineCard
                    entry={active}
                    onClose={
                      selected && active === selected
                        ? () => setSelectedId(null)
                        : undefined
                    }
                  />
                ) : null}
              </div>
            </TimelineSlot>
            <TimelineIndex
              activeId={activeId}
              className="hidden lg:flex"
              controls={stageCardId}
              onHover={setHoverId}
              onKeyboardFocus={revealEntry}
              onSelect={toggleSelected}
              selectedId={selectedId}
              timeline={timeline}
            />
          </>
        ) : null}
        <div className={cn("flex flex-col gap-3", hasWebGL && "lg:hidden")}>
          <TimelineRail
            controls={railCardId}
            onSelect={toggleSelected}
            selectedId={selectedId}
            timeline={timeline}
          />
          <div aria-live="polite" id={railCardId}>
            {selected ? (
              <TimelineCard
                className="w-full max-w-sm"
                entry={selected}
                onClose={() => setSelectedId(null)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

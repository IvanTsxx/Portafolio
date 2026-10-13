"use client";

import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState, useSyncExternalStore } from "react";
import type { FocusEvent } from "react";

import { StairsSlot } from "@/components/scene/stairs-slot";
import { useWebGLSupport } from "@/components/scene/webgl-support";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motionKit } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

import { StairCard } from "./stair-card";
import type { Stair } from "./stairs-model";
import { progressOfStep, stepAtProgress } from "./stairs-model";

const desktopQuery = "(min-width: 64rem)";
const stickyTopPixels = 64;

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

export const StairsStage = ({ stairs }: { stairs: readonly Stair[] }) => {
  const isDesktop = useIsDesktop();
  const hasWebGL = useWebGLSupport();
  const isReduced = useReducedMotion();
  const isScrubbing = isDesktop && hasWebGL && !isReduced;
  const top = stairs.length - 1;
  const [scrollIndex, setScrollIndex] = useState(0);
  const [tapIndex, setTapIndex] = useState(top);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);

  const restIndex = isScrubbing ? scrollIndex : tapIndex;
  const shownIndex = previewIndex ?? restIndex;
  const activeIndex = isReduced ? top : shownIndex;
  const shown = stairs[shownIndex];

  motionKit.useGSAP(
    () => {
      const wrapperElement = wrapper.current;
      const stageElement = stage.current;
      if (!(isScrubbing && wrapperElement && stageElement)) {
        trigger.current = null;
        return;
      }
      trigger.current = motionKit.ScrollTrigger.create({
        end: () =>
          `+=${Math.max(1, wrapperElement.offsetHeight - stageElement.offsetHeight)}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setScrollIndex(stepAtProgress(self.progress, stairs.length));
        },
        start: `top ${stickyTopPixels}px`,
        trigger: wrapperElement,
      });
      setScrollIndex(stepAtProgress(trigger.current.progress, stairs.length));
    },
    { dependencies: [isScrubbing, stairs.length], revertOnUpdate: true }
  );

  const select = (index: number) => {
    const scroll = trigger.current;
    if (!scroll) {
      setTapIndex(index);
      return;
    }
    setPreviewIndex(null);
    window.scrollTo({
      behavior: "smooth",
      top:
        scroll.start +
        (scroll.end - scroll.start) * progressOfStep(index, stairs.length),
    });
  };

  return (
    <div
      className={cn(
        "relative",
        hasWebGL && "lg:motion-safe:h-[calc(min(34rem,100svh-6rem)+100svh)]"
      )}
      data-stairs-mode={isScrubbing ? "scroll" : "static"}
      ref={wrapper}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          hasWebGL &&
            "lg:motion-safe:sticky lg:motion-safe:top-16 lg:motion-safe:h-[min(34rem,100svh-6rem)]"
        )}
        ref={stage}
      >
        {hasWebGL ? (
          <StairsSlot
            activeIndex={activeIndex}
            className="border-rule h-56 border sm:h-72 lg:motion-safe:h-auto lg:motion-safe:min-h-0 lg:motion-safe:flex-1 lg:motion-reduce:h-80"
            enabled={hasWebGL}
            highlightIndex={previewIndex ?? (isReduced ? null : activeIndex)}
            isReduced={isReduced}
            label="Experience as a staircase, oldest job on the bottom step, current job on top"
            onHover={setPreviewIndex}
            onSelect={select}
            stairs={stairs}
          >
            <div
              aria-live="polite"
              className="pointer-events-none absolute top-3 left-3 hidden lg:motion-safe:block"
            >
              {shown ? (
                <StairCard
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
                  key={shown.id}
                  stair={shown}
                />
              ) : null}
            </div>
          </StairsSlot>
        ) : null}
        <ol
          aria-label="Jobs"
          className={cn(
            "m-0 list-none gap-1 p-0",
            hasWebGL ? "hidden lg:motion-safe:flex" : "hidden"
          )}
        >
          {stairs.map((stair, index) => (
            <li data-build-block key={stair.id}>
              <button
                aria-current={index === shownIndex ? "step" : undefined}
                className={cn(
                  "label border-rule-strong text-graphite hover:border-ink hover:text-ink flex items-center gap-1.5 border px-2 py-1 tabular-nums transition-colors duration-100",
                  index === shownIndex &&
                    "border-ink bg-ink text-paper hover:text-paper"
                )}
                onBlur={() => setPreviewIndex(null)}
                onClick={() => select(index)}
                onFocus={(event: FocusEvent<HTMLButtonElement>) => {
                  if (event.currentTarget.matches(":focus-visible")) {
                    setPreviewIndex(index);
                  }
                }}
                onPointerEnter={() => setPreviewIndex(index)}
                onPointerLeave={() => setPreviewIndex(null)}
                type="button"
              >
                <span className="whitespace-nowrap">{stair.company}</span>
                <span className="text-current/60">{stair.year}</span>
                <span className="sr-only">
                  , {stair.role}, {stair.dates}, {stair.type}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <ol
          aria-label="Jobs, oldest first"
          className={cn(
            "m-0 grid list-none gap-2 p-0 sm:grid-cols-2",
            hasWebGL && "lg:motion-safe:hidden"
          )}
        >
          {stairs.map((stair, index) => (
            <li data-build-block key={stair.id}>
              <button
                aria-pressed={isReduced ? undefined : index === activeIndex}
                className="focus-visible:outline-ink block w-full cursor-pointer"
                onClick={() => select(index)}
                type="button"
              >
                <StairCard className="w-full" stair={stair} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

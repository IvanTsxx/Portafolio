"use client";

import type { ScrollTrigger as ScrollTriggerInstance } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";

import { CornerMarks, HomeSectionShell } from "@/components/home/primitives";
import { LazyWorkshopScene } from "@/components/home/scene/lazy-scenes";
import {
  StageReadout,
  WorkshopDiagram,
} from "@/components/home/workshop-diagram";
import { homeSection } from "@/lib/home/sections";
import {
  stageIndexAtProgress,
  workshopStageAt,
  workshopStageCount,
  workshopStages,
} from "@/lib/home/workshop";
import { motionKit } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

const { gsap, useGSAP } = motionKit;

const sequencedMedia =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const pinLengthInViewports = 2.6;
const section = homeSection("workshop");

type StageState = "active" | "done" | "upcoming" | "static";

const stageStateFor = (
  index: number,
  activeStage: number,
  isSequenced: boolean
): StageState => {
  if (!isSequenced) {
    return "static";
  }
  if (index === activeStage) {
    return "active";
  }
  return index < activeStage ? "done" : "upcoming";
};

export const Workshop = () => {
  const panel = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const trigger = useRef<ScrollTriggerInstance | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [isSequenced, setIsSequenced] = useState(false);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(sequencedMedia, () => {
        setIsSequenced(true);
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            end: () => `+=${window.innerHeight * pinLengthInViewports}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressRef.current = self.progress;
              const next = stageIndexAtProgress(self.progress);
              setActiveStage((current) => (current === next ? current : next));
            },
            pin: true,
            scrub: 0.4,
            start: "top top+=48",
            trigger: panel.current,
          },
        });
        trigger.current = timeline.scrollTrigger ?? null;

        for (const [index, stage] of workshopStages.entries()) {
          timeline.addLabel(stage.id, index);
        }

        timeline
          .fromTo(
            "[data-workshop-rail]",
            { scaleY: 0 },
            {
              duration: workshopStageCount,
              scaleY: 1,
              transformOrigin: "top center",
            },
            "issue"
          )
          .fromTo(
            "[data-workshop-meter]",
            { scaleX: 0 },
            {
              duration: workshopStageCount,
              scaleX: 1,
              transformOrigin: "left center",
            },
            "issue"
          );

        return () => {
          trigger.current = null;
          progressRef.current = 0;
          setIsSequenced(false);
          setActiveStage(0);
        };
      });
    },
    { scope: panel }
  );

  const scrollToStage = (index: number) => {
    const { current } = trigger;
    if (!current) {
      return;
    }
    const stageCenter = (index + 0.5) / workshopStageCount;
    window.scrollTo({
      behavior: "smooth",
      top: current.start + (current.end - current.start) * stageCenter,
    });
  };

  const active = workshopStageAt(activeStage);

  return (
    <HomeSectionShell className="py-24 lg:py-0" id="workshop">
      <div
        className={cn(
          "grid gap-10 lg:grid-cols-12 lg:gap-6 lg:py-8",
          isSequenced && "lg:h-below-header"
        )}
        ref={panel}
      >
        <div className="flex min-h-0 flex-col gap-8 lg:col-span-4 lg:gap-6">
          <header className="border-rule flex flex-col gap-4 border-t pt-6">
            <p className="label text-faint">
              <span className="text-clay">{section.index}</span>
              <span className="px-2">/</span>
              {section.label}
              <span className="px-2">/</span>
              Illustrative
            </p>
            <h2 className="display text-5xl xl:text-6xl" id="workshop-title">
              One issue in, one module out.
            </h2>
            <p className="text-muted-foreground max-w-sm text-sm text-pretty">
              How I run a feature: a Linear issue, parallel worktrees in
              Conductor, specialists loaded with skills and MCPs, then my review
              before anything merges.
            </p>
          </header>
          <div className="relative lg:min-h-0">
            <span
              aria-hidden
              className="bg-rule absolute inset-y-0 left-0 w-px"
            />
            <span
              aria-hidden
              className="bg-clay absolute inset-y-0 left-0 hidden w-px data-[sequenced=true]:block"
              data-sequenced={isSequenced}
              data-workshop-rail
            />
            <ol className="flex flex-col">
              {workshopStages.map((stage, index) => {
                const state = stageStateFor(index, activeStage, isSequenced);
                const heading = (
                  <span className="flex items-baseline gap-3">
                    <span className="label text-faint group-data-[state=active]/stage:text-clay group-data-[state=done]/stage:text-muted-foreground group-data-[state=static]/stage:text-clay transition-colors">
                      {stage.index}
                    </span>
                    <span className="text-muted-foreground group-data-[state=active]/stage:text-foreground group-data-[state=static]/stage:text-foreground text-base font-medium transition-colors">
                      {stage.title}
                    </span>
                    <span className="label text-faint ml-auto">
                      {stage.tool}
                    </span>
                  </span>
                );
                return (
                  <li
                    aria-current={state === "active" ? "step" : undefined}
                    className="group/stage relative py-1 pl-4"
                    data-state={state}
                    key={stage.id}
                  >
                    {isSequenced ? (
                      <button
                        className="flex min-h-11 w-full cursor-pointer items-center text-left"
                        onClick={() => scrollToStage(index)}
                        type="button"
                      >
                        <span className="w-full">{heading}</span>
                      </button>
                    ) : (
                      heading
                    )}
                    <p className="text-muted-foreground pl-8 text-sm text-pretty">
                      {stage.summary}
                    </p>
                    {isSequenced ? null : (
                      <p className="text-muted-foreground mt-1 pl-8 text-xs text-pretty">
                        {stage.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <div className="flex min-h-0 flex-col gap-6 lg:col-span-8">
          <div className="border-rule bg-card/40 relative hidden min-h-96 flex-1 border lg:block">
            <CornerMarks />
            <LazyWorkshopScene
              activeStage={isSequenced ? activeStage : workshopStageCount - 1}
              className="absolute inset-0"
              progressRef={progressRef}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4">
              <span className="label text-faint">Fig. 02 · Workbench</span>
              <span aria-hidden className="label text-faint tabular-nums">
                {isSequenced
                  ? `Stage ${active.index} / 0${workshopStageCount}`
                  : "All stages"}
              </span>
            </div>
            <span
              aria-hidden
              className="bg-clay absolute inset-x-0 top-0 hidden h-px data-[sequenced=true]:block"
              data-sequenced={isSequenced}
              data-workshop-meter
            />
          </div>
          {isSequenced ? (
            <div
              aria-live="polite"
              className="border-rule grid h-44 shrink-0 grid-cols-12 gap-6 border-t pt-5"
            >
              <div className="col-span-3 flex flex-col gap-2">
                <span className="label text-faint">
                  <span className="text-clay">{active.index}</span> ·{" "}
                  {active.tool}
                </span>
                <p className="text-foreground text-sm text-pretty">
                  {active.note}
                </p>
              </div>
              <div
                className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:ease-out-quart col-span-9 motion-safe:duration-500"
                key={active.id}
              >
                <StageReadout stageId={active.id} />
              </div>
            </div>
          ) : (
            <WorkshopDiagram className="border-rule border-t pt-6" />
          )}
        </div>
      </div>
    </HomeSectionShell>
  );
};

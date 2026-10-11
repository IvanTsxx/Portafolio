"use client";

import { Tabs } from "@base-ui/react/tabs";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { AgentScene } from "@/components/scene/agent-scene";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { workSteps } from "@/lib/site/practice";
import type { WorkStep } from "@/lib/site/practice";
import { cn } from "@/lib/utils";

import { PanelCount, SectionFrame } from "./section-frame";

type StepId = WorkStep["id"];

const [firstStep] = workSteps;

const stepIndexOf = (id: StepId) =>
  workSteps.findIndex((step) => step.id === id);

const nextStepOf = (id: StepId) =>
  workSteps[(stepIndexOf(id) + 1) % workSteps.length]?.id ?? firstStep.id;

const padIndex = (index: number) => String(index + 1).padStart(2, "0");

const useInView = (target: RefObject<HTMLElement | null>) => {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const element = target.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
      { threshold: 0.35 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);
  return isInView;
};

const StepTab = ({
  index,
  isActive,
  isPlaying,
  showsProgress,
  step,
  onComplete,
}: {
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  showsProgress: boolean;
  step: WorkStep;
  onComplete: () => void;
}) => (
  <Tabs.Tab
    className="group/step border-rule data-[active]:bg-paper-deep/40 pointer-fine:hover:not-data-[active]:bg-paper-deep/20 focus-visible:outline-ink relative flex w-full cursor-pointer flex-col gap-1.5 border-b px-4 pt-4 pb-5 text-left transition-colors duration-200 focus-visible:outline-1 focus-visible:-outline-offset-4 md:px-5"
    value={step.id}
  >
    <span className="label flex items-baseline justify-between">
      <span
        className={cn(
          "flex items-center gap-1.5 tabular-nums transition-colors duration-200",
          isActive
            ? "text-ink"
            : "text-mist pointer-fine:group-hover/step:text-graphite"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "bg-ink h-px w-2 origin-left transition-transform duration-200 ease-out motion-reduce:transition-none",
            isActive
              ? "scale-x-100"
              : "scale-x-0 pointer-fine:group-hover/step:scale-x-100"
          )}
        />
        {`ST-${padIndex(index)}`}
      </span>
      <span className="jp text-mist">{step.jp}</span>
    </span>
    <span
      className={cn(
        "text-xl leading-tight font-light tracking-tight transition-colors duration-200",
        isActive
          ? "text-ink"
          : "text-graphite pointer-fine:group-hover/step:text-ink"
      )}
    >
      {step.title}
    </span>
    <span aria-hidden className="bg-rule absolute inset-x-0 bottom-0 h-px">
      {isActive && showsProgress ? (
        <span
          className="bg-ink animate-step-progress block h-px origin-left"
          onAnimationEnd={onComplete}
          style={{ animationPlayState: isPlaying ? "running" : "paused" }}
        />
      ) : null}
      {isActive && !showsProgress ? (
        <span className="bg-ink block h-px" />
      ) : null}
    </span>
  </Tabs.Tab>
);

const SceneStage = ({ step }: { step: WorkStep }) => (
  <div className="animate-in fade-in ease-out-quint relative duration-500 motion-reduce:animate-none">
    <AgentScene
      label={`${step.title} scene: agents at work`}
      scene={step.scene}
    />
    <p className="sr-only">{step.summary}</p>
  </div>
);

export const HowIWork = () => {
  const section = useRef<HTMLDivElement>(null);
  const isInView = useInView(section);
  const isReduced = useReducedMotion();
  const [activeId, setActiveId] = useState<StepId>(firstStep.id);
  const [isHeld, setIsHeld] = useState(false);
  const isPlaying = isInView && !isHeld && !isReduced;

  return (
    <SectionFrame
      aside={
        <PanelCount
          current={stepIndexOf(activeId) + 1}
          total={workSteps.length}
        />
      }
      id="how-i-work"
      index="GH-06"
      jp="仕事の流儀"
      label="How I work"
    >
      <Tabs.Root
        className="border-rule grid border lg:grid-cols-12"
        onValueChange={(value) => {
          const step = workSteps.find((entry) => entry.id === value);
          if (step) {
            setActiveId(step.id);
          }
        }}
        orientation="vertical"
        value={activeId}
      >
        <div
          className="border-rule flex flex-col max-lg:order-2 max-lg:border-t lg:col-span-5 lg:border-r"
          onBlur={() => setIsHeld(false)}
          onFocus={() => setIsHeld(true)}
          onPointerEnter={() => setIsHeld(true)}
          onPointerLeave={() => setIsHeld(false)}
          ref={section}
        >
          <Tabs.List aria-label="How I work" className="flex flex-col">
            {workSteps.map((step, index) => (
              <StepTab
                index={index}
                isActive={step.id === activeId}
                isPlaying={isPlaying}
                key={step.id}
                onComplete={() => setActiveId(nextStepOf(step.id))}
                showsProgress={!isReduced}
                step={step}
              />
            ))}
          </Tabs.List>
        </div>
        <div className="flex flex-col max-lg:order-1 lg:col-span-7">
          {workSteps.map((step) => (
            <Tabs.Panel
              className="bg-paper-deep/40 relative"
              key={step.id}
              value={step.id}
            >
              {step.id === activeId ? <SceneStage step={step} /> : null}
            </Tabs.Panel>
          ))}
          <div
            aria-hidden
            className="border-rule grid flex-1 border-t px-4 py-5 md:px-5"
          >
            {workSteps.map((step) => (
              <p
                className={cn(
                  "text-graphite col-start-1 row-start-1 max-w-prose text-base leading-relaxed text-pretty transition-opacity duration-300 motion-reduce:transition-none",
                  step.id === activeId ? "opacity-100" : "opacity-0"
                )}
                key={step.id}
              >
                {step.summary}
              </p>
            ))}
          </div>
        </div>
      </Tabs.Root>
    </SectionFrame>
  );
};

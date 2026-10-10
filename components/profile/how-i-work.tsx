"use client";

import { Tabs } from "@base-ui/react/tabs";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { AgentScene } from "@/components/scene/agent-scene";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { AgentSceneId } from "@/lib/agents/scenes";
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
    className="group/step border-rule data-[active]:bg-paper-deep/40 focus-visible:outline-ink relative flex w-full flex-col gap-2 border-b px-4 pt-4 pb-5 text-left transition-colors duration-200 focus-visible:outline-1 focus-visible:-outline-offset-4 md:px-5"
    value={step.id}
  >
    <span className="label flex items-baseline justify-between">
      <span
        className={cn(
          "tabular-nums transition-colors",
          isActive ? "text-ink" : "text-mist"
        )}
      >
        {`ST-${padIndex(index)}`}
      </span>
      <span className="jp text-mist">{step.jp}</span>
    </span>
    <span
      className={cn(
        "text-xl leading-tight font-light tracking-tight transition-colors",
        isActive ? "text-ink" : "text-graphite"
      )}
    >
      {step.title}
    </span>
    <span
      className={cn(
        "text-graphite grid text-sm leading-relaxed text-pretty transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none",
        isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <span className="overflow-hidden">{step.summary}</span>
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

const SceneStage = ({ scene }: { scene: AgentSceneId }) => (
  <div className="animate-in fade-in ease-out-quint relative h-full duration-500 motion-reduce:animate-none">
    <AgentScene
      className="lg:aspect-auto lg:h-full lg:min-h-96"
      label={`${scene} scene: agents at work`}
      scene={scene}
    />
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
      index="GH-09"
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
        {workSteps.map((step) => (
          <Tabs.Panel
            className="bg-paper-deep/40 relative max-lg:order-1 lg:col-span-7"
            key={step.id}
            value={step.id}
          >
            {step.id === activeId ? <SceneStage scene={step.scene} /> : null}
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </SectionFrame>
  );
};

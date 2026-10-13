"use client";

import { Tabs } from "@base-ui/react/tabs";
import { ArrowRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { StageScene } from "@/components/scene/stage-scene";
import { focusRingClassName, linkClassName } from "@/components/site/styles";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { workSteps } from "@/lib/site/practice";
import type { WorkStep } from "@/lib/site/practice";
import { cn } from "@/lib/utils";

const stepSeconds = 8;
const [firstStep] = workSteps;

const padIndex = (index: number) => String(index + 1).padStart(2, "0");

const stepAfter = (id: WorkStep["id"]) => {
  const index = workSteps.findIndex((step) => step.id === id);
  return workSteps[(index + 1) % workSteps.length] ?? firstStep;
};

const useInView = () => {
  const target = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const element = target.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
      { threshold: 0.5 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [target, isInView] as const;
};

export const WorkStages = () => {
  const [root, isInView] = useInView();
  const isReduced = useReducedMotion();
  const [active, setActive] = useState<WorkStep>(firstStep);
  const [isHeld, setIsHeld] = useState(false);
  const [progressBar, setProgressBar] = useState<HTMLSpanElement | null>(null);
  const timer = useRef<Animation | null>(null);
  const isPlaying = isInView && !isHeld && !isReduced;
  const activeIndex = workSteps.indexOf(active);

  const advance = useEffectEvent(() => setActive(stepAfter(active.id)));
  const shouldPlay = useEffectEvent(() => isPlaying);

  useEffect(() => {
    if (!progressBar || isReduced) {
      return;
    }
    const animation = progressBar.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: stepSeconds * 1000, easing: "linear", fill: "forwards" }
    );
    if (!shouldPlay()) {
      animation.pause();
    }
    animation.onfinish = () => advance();
    timer.current = animation;
    return () => {
      animation.onfinish = null;
      animation.cancel();
      timer.current = null;
    };
  }, [isReduced, progressBar]);

  useEffect(() => {
    if (isPlaying) {
      timer.current?.play();
    } else {
      timer.current?.pause();
    }
  }, [isPlaying]);

  return (
    <Tabs.Root
      className="border-rule flex flex-col border"
      onValueChange={(value) => {
        const step = workSteps.find((entry) => entry.id === value);
        if (step) {
          setActive(step);
        }
      }}
      ref={root}
      value={active.id}
    >
      <StageScene
        className="bg-paper-deep/40 aspect-4/3 sm:aspect-video"
        label={`${active.title}: ${active.summary}`}
        stage={active.id}
      >
        <figcaption
          aria-hidden
          className="label pointer-events-none absolute inset-x-0 top-0 z-40 flex items-baseline gap-3 p-3"
        >
          <span className="flex items-baseline gap-2">
            <span className="text-mist tabular-nums">
              ST-{padIndex(activeIndex)}
            </span>
            <span className="text-ink">{active.title}</span>
          </span>
        </figcaption>
      </StageScene>
      <Tabs.List
        aria-label="How I work"
        className="border-rule grid grid-cols-7 border-t"
        data-build-block
        onBlur={() => setIsHeld(false)}
        onFocus={() => setIsHeld(true)}
        onPointerEnter={() => setIsHeld(true)}
        onPointerLeave={() => setIsHeld(false)}
      >
        {workSteps.map((step, index) => {
          const isActive = step.id === active.id;
          return (
            <Tabs.Tab
              aria-label={step.title}
              className={cn(
                "group/step border-rule ease-mechanical relative flex min-h-14 cursor-pointer flex-col items-start justify-center gap-0.5 border-l px-2 text-left transition-colors duration-100 first:border-l-0 md:px-3",
                isActive
                  ? "bg-paper-deep/40"
                  : "pointer-fine:hover:bg-paper-deep/20",
                focusRingClassName
              )}
              key={step.id}
              value={step.id}
            >
              <span
                className={cn(
                  "label tabular-nums",
                  isActive
                    ? "text-ink"
                    : "text-mist pointer-fine:group-hover/step:text-graphite"
                )}
              >
                {padIndex(index)}
              </span>
              <span
                className={cn(
                  "hidden w-full text-xs leading-tight text-pretty hyphens-auto sm:block",
                  isActive ? "text-ink" : "text-graphite"
                )}
              >
                {step.title}
              </span>
              <span
                aria-hidden
                className="bg-rule absolute inset-x-0 bottom-0 h-px overflow-hidden"
              >
                {isActive ? (
                  <span
                    className="bg-ink block h-px origin-left motion-reduce:scale-x-100"
                    ref={setProgressBar}
                    style={isReduced ? undefined : { transform: "scaleX(0)" }}
                  />
                ) : null}
              </span>
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
      {workSteps.map((step) => (
        <Tabs.Panel
          className="border-rule flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t px-3 py-3 md:px-4"
          data-build-block
          key={step.id}
          value={step.id}
        >
          <span className="label text-ink">{step.title}</span>
          <span className="text-graphite text-sm text-pretty">
            {step.summary}
          </span>
          {"href" in step ? (
            <Link
              className={cn(
                "label text-ink inline-flex items-center gap-1",
                linkClassName
              )}
              href={step.href}
            >
              Open the lab
              <ArrowRightIcon aria-hidden className="size-3" />
            </Link>
          ) : null}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
};

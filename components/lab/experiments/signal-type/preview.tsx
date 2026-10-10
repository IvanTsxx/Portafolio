"use client";

import { useEffect, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  SliderControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { motionKit } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

import {
  axesAt,
  letterStyle,
  rampInfluence,
  weightAxis,
  widthAxis,
} from "./axes";
import { archivo } from "./font";

const { gsap, useGSAP } = motionKit;

const wordOptions = [
  { label: "Signal", value: "signal" },
  { label: "Debug", value: "debug" },
  { label: "Assemble", value: "assemble" },
] as const;

const modeOptions = [
  { label: "Pointer", value: "pointer" },
  { label: "Wave", value: "wave" },
] as const;

type Word = (typeof wordOptions)[number]["value"];
type Mode = (typeof modeOptions)[number]["value"];

const restInfluence = 0.2;

const SignalTypePreview = () => {
  const {
    activity,
    isReduced,
    ref: stageRef,
  } = useStageActivity<HTMLDivElement>();
  const wordRef = useRef<HTMLParagraphElement>(null);
  const waveRef = useRef<ReturnType<typeof gsap.fromTo> | null>(null);
  const isRunningRef = useRef(false);
  const [word, setWord] = useState<Word>("signal");
  const [mode, setMode] = useState<Mode>("pointer");
  const [radius, setRadius] = useState(220);
  const [assemblyCount, setAssemblyCount] = useState(0);

  const letters = [...word.toUpperCase()];

  useGSAP(
    () => {
      const stage = stageRef.current;
      const spans = gsap.utils.toArray<HTMLSpanElement>("[data-letter]");
      if (!stage || isReduced || spans.length === 0) {
        return;
      }

      if (mode === "wave") {
        waveRef.current = gsap.fromTo(spans, axesAt(0), {
          ...axesAt(1),
          duration: 0.9,
          ease: "sine.inOut",
          paused: !isRunningRef.current,
          repeat: -1,
          stagger: { each: 0.09 },
          yoyo: true,
        });
        return;
      }

      const setters = spans.map((span) => ({
        weight: gsap.quickTo(span, "--wght", {
          duration: 0.45,
          ease: "power3.out",
        }),
        width: gsap.quickTo(span, "--wdth", {
          duration: 0.6,
          ease: "power3.out",
        }),
      }));

      const settle = (influenceFor: (span: HTMLSpanElement) => number) => {
        for (const [spanIndex, span] of spans.entries()) {
          const axes = axesAt(influenceFor(span));
          setters[spanIndex]?.width(axes["--wdth"]);
          setters[spanIndex]?.weight(axes["--wght"]);
        }
      };

      const handleMove = (event: PointerEvent) => {
        const centers = spans.map((span) => {
          const rect = span.getBoundingClientRect();
          return rect.left + rect.width / 2;
        });
        settle((span) => {
          const distance = Math.abs(
            event.clientX - (centers[spans.indexOf(span)] ?? 0)
          );
          const proximity = Math.max(0, 1 - distance / radius);
          return restInfluence + (1 - restInfluence) * proximity * proximity;
        });
      };

      const handleLeave = () => settle(() => restInfluence);

      stage.addEventListener("pointermove", handleMove);
      stage.addEventListener("pointerleave", handleLeave);
      return () => {
        stage.removeEventListener("pointermove", handleMove);
        stage.removeEventListener("pointerleave", handleLeave);
      };
    },
    {
      dependencies: [word, mode, radius, isReduced],
      revertOnUpdate: true,
      scope: wordRef,
    }
  );

  useGSAP(
    () => {
      if (isReduced) {
        return;
      }
      gsap.from("[data-letter]", {
        autoAlpha: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.05,
        yPercent: 110,
      });
    },
    { dependencies: [word, assemblyCount, isReduced], scope: wordRef }
  );

  useEffect(() => {
    isRunningRef.current = activity === "running";
    waveRef.current?.paused(!isRunningRef.current);
  }, [activity]);

  return (
    <ExperimentStage
      activity={activity}
      className="blueprint-grid touch-pan-y [--grid-size:24px]"
      controls={
        <>
          <ToggleControl
            label="Word"
            onChange={setWord}
            options={wordOptions}
            value={word}
          />
          <ToggleControl
            disabled={isReduced}
            hint={
              isReduced
                ? "Unavailable under reduced motion."
                : "Pointer follows the cursor. Wave loops on its own and pauses offscreen."
            }
            label="Mode"
            onChange={setMode}
            options={modeOptions}
            value={mode}
          />
          <SliderControl
            disabled={isReduced || mode === "wave"}
            format={(value) => `${value}px`}
            label="Falloff radius"
            max={420}
            min={80}
            onChange={setRadius}
            step={10}
            value={radius}
          />
          <ActionControl
            actionLabel="Replay"
            disabled={isReduced}
            label="Assembly"
            onAction={() => setAssemblyCount((count) => count + 1)}
          />
          <p className="label text-mist px-5 py-4 tabular-nums">
            wdth {widthAxis.min}–{widthAxis.max} · wght {weightAxis.min}–
            {weightAxis.max}
          </p>
        </>
      }
      reducedNote="Reduced motion is on. The word is set as a fixed width ramp, with no tweening or pointer tracking."
      stageLabel="A word whose letter widths and weights respond to the pointer"
      stageRef={stageRef}
    >
      <div className="flex size-full items-center justify-center overflow-hidden px-6">
        <p
          className={cn(
            archivo.className,
            "text-ink flex overflow-hidden py-4 text-6xl leading-none select-none sm:text-8xl lg:text-9xl"
          )}
          key={word}
          ref={wordRef}
        >
          <span className="sr-only">{word}</span>
          {letters.map((letter, letterIndex) => {
            const influence = isReduced
              ? rampInfluence(letterIndex, letters.length)
              : restInfluence;
            return (
              <span
                aria-hidden
                className="inline-block"
                data-letter
                key={`${word}-${letterIndex.toString()}`}
                style={letterStyle(influence)}
              >
                {letter}
              </span>
            );
          })}
        </p>
      </div>
    </ExperimentStage>
  );
};

export default SignalTypePreview;

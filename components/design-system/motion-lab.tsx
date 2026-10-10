"use client";

import { ArrowCounterClockwiseIcon, PlayIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { technicalButtonVariants } from "@/components/site/styles";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { EasingToken } from "@/lib/design-system/model";
import type { DurationSpec, EasingName } from "@/lib/design-system/specs";
import { cn } from "@/lib/utils";

const easingClassNames = {
  "in-out-quart": "ease-in-out-quart",
  mechanical: "ease-mechanical",
  "out-expo": "ease-out-expo",
  "out-quart": "ease-out-quart",
  "out-quint": "ease-out-quint",
} as const satisfies Record<EasingName, string>;

const EasingTrack = ({
  easing,
  isPlaying,
}: {
  easing: EasingToken;
  isPlaying: boolean;
}) => (
  <li className="border-rule flex flex-col gap-2 border-b py-3">
    <p className="label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span className="text-ink normal-case">{easing.className}</span>
      <span className="text-mist normal-case">{easing.curve}</span>
    </p>
    <div className="border-rule-strong @container relative h-6 border-b border-dotted">
      <span
        aria-hidden
        className={cn(
          "bg-ink absolute bottom-0 left-0 block size-4 transition-transform duration-700 motion-reduce:transition-none",
          easingClassNames[easing.name],
          isPlaying && "translate-x-[calc(100cqw-1rem)]"
        )}
      />
    </div>
    <p className="text-graphite text-sm leading-snug text-pretty">
      {easing.use}
    </p>
  </li>
);

const DurationTrack = ({
  duration,
  isPlaying,
}: {
  duration: DurationSpec;
  isPlaying: boolean;
}) => (
  <li className="label border-rule grid grid-cols-[5rem_3rem_1fr] items-center gap-x-3 gap-y-1 border-b py-2 md:grid-cols-[5rem_3rem_1fr_auto]">
    <span className="text-ink">{duration.name}</span>
    <span className="text-mist tabular-nums">{duration.ms}</span>
    <span aria-hidden className="border-rule-strong block h-2 border">
      <span
        className={cn(
          "bg-ink block h-full origin-left scale-x-0 transition-transform motion-reduce:transition-none",
          duration.className,
          easingClassNames[duration.ease],
          isPlaying && "scale-x-100"
        )}
      />
    </span>
    <span className="text-graphite col-span-3 normal-case md:col-span-1">
      {duration.use}
    </span>
  </li>
);

export const MotionLab = ({
  durations,
  easings,
}: {
  durations: readonly DurationSpec[];
  easings: readonly EasingToken[];
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isReduced = useReducedMotion();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <button
          aria-pressed={isPlaying}
          className={technicalButtonVariants({
            tone: isPlaying ? "selected" : "solid",
          })}
          onClick={() => setIsPlaying((current) => !current)}
          type="button"
        >
          {isPlaying ? (
            <ArrowCounterClockwiseIcon aria-hidden className="size-4" />
          ) : (
            <PlayIcon aria-hidden className="size-4" />
          )}
          {isPlaying ? "Reset" : "Play"}
        </button>
        <p aria-live="polite" className="label text-mist">
          Prefers reduced motion{" "}
          <span className="text-ink">{isReduced ? "On, snaps" : "Off"}</span>
        </p>
      </div>
      <ul className="border-rule border-t">
        {easings.map((easing) => (
          <EasingTrack
            easing={easing}
            isPlaying={isPlaying}
            key={easing.name}
          />
        ))}
      </ul>
      <ul className="border-rule border-t">
        {durations.map((duration) => (
          <DurationTrack
            duration={duration}
            isPlaying={isPlaying}
            key={duration.name}
          />
        ))}
      </ul>
    </div>
  );
};

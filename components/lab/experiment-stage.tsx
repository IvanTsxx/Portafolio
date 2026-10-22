import type { ReactNode, Ref } from "react";

import { controlGridClassName } from "@/components/lab/lab-controls";
import type { StageActivity } from "@/components/lab/use-stage-activity";
import { CornerMarks } from "@/components/site/corner-marks";
import { cn } from "@/lib/utils";

const activityCopy = {
  offscreen: { label: "Paused offscreen", tone: "bg-transparent" },
  reduced: {
    label: "Reduced motion",
    tone: "bg-[repeating-linear-gradient(135deg,var(--ink)_0_1px,transparent_1px_3px)]",
  },
  running: { label: "Live", tone: "bg-ink motion-safe:animate-pulse" },
} as const satisfies Record<StageActivity, { label: string; tone: string }>;

export const CornerMarkers = () => <CornerMarks />;

interface ExperimentStageProps {
  activity: StageActivity;
  children: ReactNode;
  controls?: ReactNode;
  reducedNote: string;
  stageLabel: string;
  stageRef: Ref<HTMLDivElement>;
  className?: string;
}

export const ExperimentStage = ({
  activity,
  children,
  controls,
  reducedNote,
  stageLabel,
  stageRef,
  className,
}: ExperimentStageProps) => {
  const status = activityCopy[activity];
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "border-rule-strong bg-popover relative aspect-4/5 overflow-hidden border sm:aspect-4/3 lg:aspect-16/10",
          className
        )}
        ref={stageRef}
      >
        <figure aria-label={stageLabel} className="m-0 size-full">
          {children}
        </figure>
        <CornerMarks />
        <p className="label bg-paper/90 text-graphite border-rule-strong pointer-events-none absolute top-4 left-5 flex items-center gap-2 border px-2 py-1 backdrop-blur-sm">
          <span
            aria-hidden
            className={cn("border-ink size-1.5 border", status.tone)}
          />
          {status.label}
        </p>
        {activity === "reduced" ? (
          <p className="bg-paper/90 text-graphite border-rule-strong pointer-events-none absolute right-5 bottom-5 left-5 max-w-sm border px-3 py-2 text-xs/relaxed backdrop-blur-sm">
            {reducedNote}
          </p>
        ) : null}
      </div>
      {controls ? (
        <section
          aria-label="Controls"
          className="border-rule-strong bg-popover flex flex-col border border-t-0"
        >
          <h2 className="label border-rule-strong flex items-baseline gap-3 border-b px-5 py-3">
            <span className="text-mist tabular-nums">[ CTL ]</span>
            <span className="text-ink font-normal">Controls</span>
          </h2>
          <div className={controlGridClassName}>{controls}</div>
        </section>
      ) : null}
    </div>
  );
};

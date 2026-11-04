import type { ReactNode, Ref } from "react";

import { controlGridClassName } from "@/components/lab/lab-controls";
import { OriginalImage } from "@/components/lab/original-view";
import type { StageImage } from "@/components/lab/source/tone-chunk";
import type { StageActivity } from "@/components/lab/use-stage-activity";
import { CornerMarks } from "@/components/site/corner-marks";
import { cn } from "@/lib/utils";

const activityCopy = {
  offscreen: { label: "Paused offscreen", tone: "bg-transparent" },
  reduced: {
    label: "Reduced motion",
    tone: "bg-[repeating-linear-gradient(135deg,var(--foreground)_0_1px,transparent_1px_3px)]",
  },
  running: { label: "Live", tone: "bg-foreground motion-safe:animate-pulse" },
} as const satisfies Record<StageActivity, { label: string; tone: string }>;

interface ExperimentStageProps {
  activity: StageActivity;
  before?: StageImage;
  children: ReactNode;
  controls?: ReactNode;
  reducedNote: string;
  stageLabel: string;
  stageRef: Ref<HTMLDivElement>;
  className?: string;
}

export const ExperimentStage = ({
  activity,
  before,
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
          "border-border bg-surface relative aspect-4/5 overflow-hidden rounded-sm border sm:aspect-4/3 lg:aspect-16/10",
          className
        )}
        data-lab-stage=""
        ref={stageRef}
      >
        <figure aria-label={stageLabel} className="m-0 size-full">
          {children}
        </figure>
        {before ? <OriginalImage image={before} /> : null}
        <CornerMarks />
      </div>
      <div className="border-border-strong bg-popover flex flex-col border border-t-0">
        <div className="border-border-strong flex flex-wrap items-baseline justify-between gap-3 border-b px-5 py-3">
          {controls ? (
            <h2 className="label flex items-baseline gap-3">
              <span className="text-faint tabular-nums">[ CTL ]</span>
              <span className="text-foreground font-normal">Controls</span>
            </h2>
          ) : null}
          <p className="label text-muted-foreground ml-auto flex items-center gap-2">
            <span
              aria-hidden
              className={cn("border-foreground size-1.5 border", status.tone)}
            />
            {status.label}
          </p>
        </div>
        {activity === "reduced" ? (
          <p className="border-border-strong text-muted-foreground border-b px-5 py-3 text-xs/relaxed text-pretty">
            {reducedNote}
          </p>
        ) : null}
        {controls ? (
          <section aria-label="Controls" className={controlGridClassName}>
            {controls}
          </section>
        ) : null}
      </div>
    </div>
  );
};

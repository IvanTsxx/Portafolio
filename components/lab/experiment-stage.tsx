import type { ReactNode, Ref } from "react";

import type { StageActivity } from "@/components/lab/use-stage-activity";
import { cn } from "@/lib/utils";

const activityCopy = {
  offscreen: { label: "Paused offscreen", tone: "bg-faint" },
  reduced: { label: "Reduced motion", tone: "bg-signal-steel" },
  running: { label: "Live", tone: "bg-signal-moss" },
} as const satisfies Record<StageActivity, { label: string; tone: string }>;

export const CornerMarkers = () => (
  <>
    <span
      aria-hidden
      className="border-rule-strong pointer-events-none absolute top-2 left-2 size-3 border-t border-l"
    />
    <span
      aria-hidden
      className="border-rule-strong pointer-events-none absolute top-2 right-2 size-3 border-t border-r"
    />
    <span
      aria-hidden
      className="border-rule-strong pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l"
    />
    <span
      aria-hidden
      className="border-rule-strong pointer-events-none absolute right-2 bottom-2 size-3 border-r border-b"
    />
  </>
);

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
    <div className="grid gap-px lg:grid-cols-12">
      <div
        className={cn(
          "border-rule bg-background relative aspect-4/5 overflow-hidden border sm:aspect-video lg:col-span-8",
          !controls && "lg:col-span-12",
          className
        )}
        ref={stageRef}
      >
        <figure aria-label={stageLabel} className="m-0 size-full">
          {children}
        </figure>
        <CornerMarkers />
        <p className="label bg-background/80 text-muted-foreground pointer-events-none absolute top-4 left-6 flex items-center gap-2 px-2 py-1 backdrop-blur-sm">
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full", status.tone)}
          />
          {status.label}
        </p>
        {activity === "reduced" ? (
          <p className="bg-background/90 text-muted-foreground border-rule pointer-events-none absolute right-6 bottom-6 left-6 max-w-sm border px-3 py-2 text-xs/relaxed backdrop-blur-sm">
            {reducedNote}
          </p>
        ) : null}
      </div>
      {controls ? (
        <section
          aria-label="Controls"
          className="border-rule bg-card flex flex-col border lg:col-span-4"
        >
          <h2 className="label text-faint border-rule border-b px-5 py-3">
            Controls
          </h2>
          <div className="divide-rule flex flex-col divide-y">{controls}</div>
        </section>
      ) : null}
    </div>
  );
};

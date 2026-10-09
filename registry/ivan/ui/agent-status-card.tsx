import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const agentStatusCardVariants = cva(
  "border-border bg-card text-card-foreground relative flex flex-col border before:absolute before:inset-x-0 before:-top-px before:h-px before:bg-(--agent-tone)",
  {
    defaultVariants: { status: "idle" },
    variants: {
      status: {
        blocked: "[--agent-tone:var(--destructive)]",
        done: "[--agent-tone:var(--signal-moss)]",
        idle: "[--agent-tone:var(--muted-foreground)]",
        review: "[--agent-tone:var(--signal-steel)]",
        running: "[--agent-tone:var(--clay)]",
      },
    },
  }
);

type AgentStatus = NonNullable<
  VariantProps<typeof agentStatusCardVariants>["status"]
>;

interface AgentMeta {
  label: string;
  value: string;
}

interface AgentStatusCardProps
  extends
    Omit<ComponentProps<"article">, "title">,
    VariantProps<typeof agentStatusCardVariants> {
  agentId: string;
  announce?: boolean;
  footer?: ReactNode;
  meta?: readonly AgentMeta[];
  name: string;
  progress?: number;
  statusLabel?: string;
  task: string;
}

const defaultStatusLabels: Record<AgentStatus, string> = {
  blocked: "Blocked",
  done: "Done",
  idle: "Idle",
  review: "Awaiting review",
  running: "Running",
};

const progressSegments = 20;

const clampProgress = (progress: number) =>
  Math.min(100, Math.max(0, progress));

const CubeGlyph = () => (
  <svg
    aria-hidden="true"
    className="size-5 shrink-0 text-(--agent-tone)"
    fill="none"
    stroke="currentColor"
    strokeLinejoin="round"
    strokeWidth="1.25"
    viewBox="0 0 16 16"
  >
    <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" />
    <path d="M2 5l6 3.5L14 5M8 8.5v6" />
  </svg>
);

const StatusIndicator = ({
  announce,
  label,
  status,
}: {
  announce: boolean;
  label: string;
  status: AgentStatus;
}) => (
  <p
    className="flex shrink-0 items-center gap-2 font-mono text-xs tracking-widest text-(--agent-tone) uppercase"
    data-slot="agent-status-card-status"
    role={announce ? "status" : undefined}
  >
    <span aria-hidden="true" className="relative flex size-2">
      {status === "running" ? (
        <span className="absolute inset-0 bg-(--agent-tone) opacity-60 motion-safe:animate-ping" />
      ) : null}
      <span className="relative size-2 bg-(--agent-tone)" />
    </span>
    {label}
  </p>
);

const SegmentedProgress = ({
  progress,
  status,
}: {
  progress: number;
  status: AgentStatus;
}) => {
  const value = Math.round(clampProgress(progress));
  const filled = Math.round((value / 100) * progressSegments);

  return (
    <div className="flex items-center gap-3">
      <progress
        aria-label="Task progress"
        className="sr-only"
        max={100}
        value={value}
      >
        {value}%
      </progress>
      <div aria-hidden="true" className="flex h-2 flex-1 gap-0.5">
        {Array.from({ length: progressSegments }, (_, index) => {
          const isFilled = index < filled;
          const isActive = status === "running" && index === filled;

          return (
            <span
              className={cn(
                "bg-border flex-1",
                isFilled && "bg-(--agent-tone)",
                isActive && "bg-(--agent-tone)/60 motion-safe:animate-pulse"
              )}
              key={index}
            />
          );
        })}
      </div>
      <span
        aria-hidden="true"
        className="text-muted-foreground w-10 text-right font-mono text-xs tabular-nums"
      >
        {value}%
      </span>
    </div>
  );
};

const AgentStatusCard = ({
  agentId,
  announce = false,
  children,
  className,
  footer,
  meta,
  name,
  progress,
  status,
  statusLabel,
  task,
  ...props
}: AgentStatusCardProps) => {
  const titleId = useId();
  const resolvedStatus: AgentStatus = status ?? "idle";

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        agentStatusCardVariants({ status: resolvedStatus }),
        className
      )}
      data-slot="agent-status-card"
      data-status={resolvedStatus}
      {...props}
    >
      <header className="border-border flex items-start justify-between gap-4 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <CubeGlyph />
          <div className="flex min-w-0 flex-col">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {agentId}
            </p>
            <h3
              className="text-foreground truncate text-sm font-medium"
              id={titleId}
            >
              {name}
            </h3>
          </div>
        </div>
        <StatusIndicator
          announce={announce}
          label={statusLabel ?? defaultStatusLabels[resolvedStatus]}
          status={resolvedStatus}
        />
      </header>
      <div className="flex flex-col gap-4 px-4 py-4">
        <p className="text-foreground text-sm text-pretty">{task}</p>
        {progress === undefined ? null : (
          <SegmentedProgress progress={progress} status={resolvedStatus} />
        )}
        {children}
      </div>
      {meta?.length ? (
        <dl className="divide-border border-border flex divide-x border-t">
          {meta.map((entry) => (
            <div
              className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3"
              key={entry.label}
            >
              <dt className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                {entry.label}
              </dt>
              <dd className="text-foreground truncate font-mono text-xs tabular-nums">
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {footer ? (
        <footer className="border-border border-t px-4 py-3">{footer}</footer>
      ) : null}
    </article>
  );
};

export { AgentStatusCard };
export type { AgentMeta, AgentStatus, AgentStatusCardProps };

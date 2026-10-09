"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { AgentStatusCard } from "@/registry/ivan/ui/agent-status-card";
import type { AgentStatus } from "@/registry/ivan/ui/agent-status-card";

interface CardValues {
  announce: boolean;
  name: string;
  progress: number;
  showFooter: boolean;
  showMeta: boolean;
  status: AgentStatus;
  task: string;
}

const initialValues: CardValues = {
  announce: false,
  name: "Builder",
  progress: 62,
  showFooter: false,
  showMeta: true,
  status: "running",
  task: "Implementing the registry detail page",
};

const controls: readonly Control<keyof CardValues>[] = [
  {
    key: "status",
    kind: "choice",
    label: "Status",
    options: ["idle", "running", "review", "blocked", "done"],
  },
  {
    key: "progress",
    kind: "range",
    label: "Progress",
    max: 100,
    min: 0,
    unit: "%",
  },
  { key: "name", kind: "text", label: "Name", maxLength: 32 },
  { key: "task", kind: "text", label: "Task", maxLength: 96 },
  { key: "showMeta", kind: "toggle", label: "Metadata" },
  { key: "showFooter", kind: "toggle", label: "Footer slot" },
  { key: "announce", kind: "toggle", label: "Announce changes" },
];

const footerActionClassName =
  "inline-flex min-h-11 items-center border border-border px-4 font-mono text-xs tracking-widest uppercase transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <AgentStatusCard
        agentId="AG-03"
        announce={values.announce}
        className="w-full max-w-md"
        footer={
          values.showFooter ? (
            <div className="flex gap-2">
              <button className={footerActionClassName} type="button">
                Inspect diff
              </button>
              <button className={footerActionClassName} type="button">
                Approve
              </button>
            </div>
          ) : undefined
        }
        meta={
          values.showMeta
            ? [
                { label: "Elapsed", value: "04:12" },
                { label: "Worktree", value: "wt-registry" },
              ]
            : undefined
        }
        name={values.name}
        progress={values.progress}
        status={values.status}
        task={values.task}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <AgentStatusCard
      agentId="AG-03"
      className="w-full max-w-72"
      name="Builder"
      progress={62}
      status="running"
      task="Implementing the registry detail page"
    />
  </div>
);

import { CheckIcon } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

import { StatusDot } from "@/components/home/primitives";
import { agentProfiles } from "@/lib/agents/roles";
import type { AgentRole } from "@/lib/agents/roles";
import type { WorkflowStageId } from "@/lib/agents/workflow";
import { workshopStages, worktreeLanes } from "@/lib/home/workshop";
import type { WorktreeLane } from "@/lib/home/workshop";
import { cn } from "@/lib/utils";

const reviewChecks = ["typecheck", "lint", "build", "a11y"] as const;

const AgentChip = ({ agentRole }: { agentRole: AgentRole }) => (
  <span className="border-rule-strong bg-background inline-flex h-6 w-fit items-center gap-1.5 border px-1.5 whitespace-nowrap">
    <StatusDot />
    <span className="label text-foreground">
      {agentProfiles[agentRole].designation}
    </span>
    <span className="text-muted-foreground text-xs">
      {agentProfiles[agentRole].title}
    </span>
  </span>
);

const IssueCard = () => (
  <div className="border-signal-steel/40 blueprint-dots flex w-full max-w-64 flex-col gap-1 border p-3">
    <span className="label text-signal-steel">LIN-128</span>
    <span className="text-foreground text-sm">Home workshop sequence</span>
    <span className="label text-faint">Scope · acceptance · Figma</span>
  </div>
);

const PlanCrew = () => (
  <div className="flex flex-wrap items-start gap-1.5">
    <AgentChip agentRole="orchestrator" />
    <AgentChip agentRole="architect" />
  </div>
);

const LaneBranch = ({ lane }: { lane: WorktreeLane }) => (
  <span className="label text-muted-foreground flex items-center gap-2 normal-case">
    <span aria-hidden className="bg-rule-strong h-px w-4" />
    {lane.branch}
  </span>
);

const LaneWork = ({ lane }: { lane: WorktreeLane }) => (
  <div className="border-rule-strong flex min-w-0 flex-col gap-2 border-l pl-3">
    <span className="label text-faint normal-case">
      {lane.branch}
      {lane.role === "debugger" ? " · subagent" : ""}
    </span>
    <AgentChip agentRole={lane.role} />
    <ul aria-label="Skills" className="flex flex-wrap gap-1.5">
      {lane.skills.map((skill) => (
        <li
          className="label border-rule-strong bg-graphite text-muted-foreground inline-flex h-5 items-center border border-b-2 px-1.5 normal-case"
          key={skill}
        >
          {skill}
        </li>
      ))}
    </ul>
    {lane.mcps.map((mcp) => (
      <span
        className="label text-signal-steel inline-flex items-center gap-1.5"
        key={mcp}
      >
        <span aria-hidden className="bg-signal-steel/60 h-px w-3" />
        MCP · {mcp}
      </span>
    ))}
  </div>
);

const ReviewGate = () => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-wrap gap-1.5">
      <AgentChip agentRole="inspector" />
      <AgentChip agentRole="analyst" />
    </div>
    <ul aria-label="Checks" className="flex flex-wrap gap-x-3 gap-y-1">
      {reviewChecks.map((check) => (
        <li
          className="label text-signal-moss flex items-center gap-1"
          key={check}
        >
          <CheckIcon aria-hidden className="size-3" />
          {check}
        </li>
      ))}
    </ul>
  </div>
);

const ShipCard = () => (
  <div className="bg-clay text-primary-foreground flex w-full max-w-64 flex-col gap-1 p-3">
    <span className="label">Merged</span>
    <span className="text-sm font-medium">Home workshop, shipped</span>
    <span className="label opacity-70">
      {worktreeLanes.length} lanes → main
    </span>
  </div>
);

const stageReadouts = {
  build: () => (
    <div className="grid gap-4 md:grid-cols-3">
      {worktreeLanes.map((lane) => (
        <LaneWork key={lane.id} lane={lane} />
      ))}
    </div>
  ),
  integrate: ShipCard,
  issue: IssueCard,
  orchestrate: PlanCrew,
  review: ReviewGate,
  worktrees: () => (
    <div className="flex flex-col gap-2">
      {worktreeLanes.map((lane) => (
        <LaneBranch key={lane.id} lane={lane} />
      ))}
    </div>
  ),
} as const satisfies Record<WorkflowStageId, () => ReactNode>;

export const StageReadout = ({ stageId }: { stageId: WorkflowStageId }) => {
  const Readout = stageReadouts[stageId];
  return <Readout />;
};

export const WorkshopDiagram = ({ className }: { className?: string }) => (
  <ol
    aria-label="Workflow diagram, illustrative"
    className={cn("grid gap-x-6 gap-y-8 md:grid-cols-2", className)}
  >
    {workshopStages.map((stage) => (
      <li
        className={cn(
          "flex min-w-0 flex-col gap-3",
          stage.id === "build" && "md:col-span-2"
        )}
        key={stage.id}
      >
        <span className="label text-faint">
          <span className="text-clay">{stage.index}</span> · {stage.title} ·{" "}
          {stage.tool}
        </span>
        <StageReadout stageId={stage.id} />
      </li>
    ))}
  </ol>
);

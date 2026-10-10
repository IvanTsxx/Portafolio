"use client";

import { AgentStage } from "@/components/registry-docs/demos/agent-stage-view";
import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import {
  agentActions,
  agentRoles,
} from "@/registry/ivan/components/agent/types";
import type {
  AgentAction,
  AgentRole,
} from "@/registry/ivan/components/agent/types";

interface AgentPlaygroundValues {
  action: AgentAction;
  reducedMotion: boolean;
  role: AgentRole;
  shadow: boolean;
}

const sharedControls: readonly Control<keyof AgentPlaygroundValues>[] = [
  { key: "role", kind: "choice", label: "Role", options: agentRoles },
  { key: "action", kind: "choice", label: "Action", options: agentActions },
  { key: "reducedMotion", kind: "toggle", label: "Reduced motion" },
  { key: "shadow", kind: "toggle", label: "Contact shadow" },
];

export const AgentPlayground = ({
  initialValues,
}: {
  initialValues: AgentPlaygroundValues;
}) => (
  <Playground controls={sharedControls} initialValues={initialValues}>
    {(values, { runId }) => (
      <AgentStage
        action={values.action}
        className="h-80 w-full max-w-md"
        key={runId}
        motion={values.reducedMotion ? "reduced" : undefined}
        role={values.role}
        shadow={values.shadow}
      />
    )}
  </Playground>
);

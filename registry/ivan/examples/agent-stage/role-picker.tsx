"use client";

import { useState } from "react";

import { AgentStage } from "@/components/registry-docs/demos/agent-stage-view";
import { agentRoles } from "@/registry/ivan/components/agent/types";
import type { AgentRole } from "@/registry/ivan/components/agent/types";

export const Example = () => {
  const [role, setRole] = useState<AgentRole>("builder");

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <AgentStage className="h-72 w-full" role={role} />
      <div className="flex flex-wrap gap-2">
        {agentRoles.map((option) => (
          <button
            aria-pressed={option === role}
            className="border-border hover:bg-accent aria-pressed:bg-foreground aria-pressed:text-background border px-3 py-2 text-sm"
            key={option}
            onClick={() => setRole(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

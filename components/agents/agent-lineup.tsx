"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { StageFallback } from "@/components/scene/stage-fallback";
import { Button } from "@/components/ui/button";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { agentActions, agentProfiles, agentRoles } from "@/lib/agents/roles";

import type { AgentMotion } from "./use-agent-rig";

const lineupLabel = "Loading agent lineup";

const AgentLineupScene = dynamic(() => import("./agent-lineup-scene"), {
  loading: () => <StageFallback label={lineupLabel} />,
  ssr: false,
});

type ActionChoice = AgentAction | "signature";

export interface AgentLineupProps {
  initialAction?: ActionChoice;
  initialMotion?: AgentMotion;
  soloRole?: AgentRole;
}

const actionChoices: readonly ActionChoice[] = ["signature", ...agentActions];

export const AgentLineup = ({
  initialAction = "signature",
  initialMotion = "full",
  soloRole,
}: AgentLineupProps) => {
  const [actionChoice, setActionChoice] = useState<ActionChoice>(initialAction);
  const [motion, setMotion] = useState<AgentMotion>(initialMotion);
  const [focusedRole, setFocusedRole] = useState<AgentRole | null>(null);
  const roles = soloRole ? [soloRole] : agentRoles;
  const entries = roles.map((role) => ({
    action:
      actionChoice === "signature"
        ? agentProfiles[role].signatureActions[0]
        : actionChoice,
    role,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {actionChoices.map((choice) => (
          <Button
            aria-pressed={choice === actionChoice}
            key={choice}
            onClick={() => setActionChoice(choice)}
            size="sm"
            variant={choice === actionChoice ? "default" : "outline"}
          >
            {choice}
          </Button>
        ))}
        <Button
          aria-pressed={motion === "reduced"}
          onClick={() => setMotion(motion === "reduced" ? "full" : "reduced")}
          size="sm"
          variant={motion === "reduced" ? "default" : "ghost"}
        >
          Reduced motion
        </Button>
      </div>
      <div className="border-rule h-120 border md:h-160">
        <AgentLineupScene
          entries={entries}
          focusedRole={focusedRole}
          motion={motion}
          onFocusRole={setFocusedRole}
        />
      </div>
      <ol className="grid grid-cols-2 gap-px md:grid-cols-4 xl:grid-cols-7">
        {entries.map(({ action, role }) => (
          <li
            className="border-rule flex flex-col gap-1 border-t pt-3"
            key={role}
          >
            <span className="label text-faint">
              {agentProfiles[role].designation}
            </span>
            <span className="text-sm">{agentProfiles[role].title}</span>
            <span className="label text-clay">{action}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

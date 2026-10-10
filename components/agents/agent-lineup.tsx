"use client";

import { lazy, useId, useRef, useState } from "react";

import { StageFallback } from "@/components/scene/stage-fallback";
import { useViewSlot } from "@/components/scene/view-registry";
import { useWebGLSupport } from "@/components/scene/webgl-support";
import { Button } from "@/components/ui/button";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { agentActions, agentProfiles, agentRoles } from "@/lib/agents/roles";

import type { AgentMotion } from "./use-agent-rig";

const lineupLabel =
  "Lineup of the workshop agents, each in its signature action";

const AgentLineupScene = lazy(() => import("./agent-lineup-scene"));

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
  const stage = useRef<HTMLElement>(null);
  const slotId = useId();
  const hasWebGL = useWebGLSupport();
  const roles = soloRole ? [soloRole] : agentRoles;
  const entries = roles.map((role) => ({
    action:
      actionChoice === "signature"
        ? agentProfiles[role].signatureActions[0]
        : actionChoice,
    role,
  }));

  useViewSlot(
    slotId,
    stage,
    <AgentLineupScene entries={entries} motion={motion} />,
    hasWebGL
  );

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
      <figure
        aria-label={lineupLabel}
        className="border-rule pointer-events-auto m-0 h-120 border md:h-160"
        ref={stage}
      >
        {hasWebGL ? null : <StageFallback label={lineupLabel} />}
      </figure>
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

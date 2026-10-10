import type { Metadata } from "next";

import { AgentScene } from "@/components/scene/agent-scene";
import { AgentWaypoint } from "@/components/scene/agent-waypoint";
import type { WaypointSide } from "@/components/scene/view-registry";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { agentProfiles } from "@/lib/agents/roles";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Companion",
};

interface Stop {
  role: AgentRole;
  side: WaypointSide;
  action?: AgentAction;
  height: string;
}

const stops: readonly Stop[] = [
  { height: "min-h-svh", role: "orchestrator", side: "right" },
  { height: "min-h-svh py-40", role: "architect", side: "left" },
  { action: "type", height: "min-h-svh", role: "builder", side: "right" },
  { height: "min-h-200", role: "debugger", side: "right" },
  { height: "min-h-svh py-32", role: "inspector", side: "left" },
  { action: "point", height: "min-h-svh", role: "analyst", side: "right" },
];

const CompanionPage = () => (
  <div className="flex flex-col">
    {stops.map(({ action, height, role, side }, index) => (
      <section
        className={`border-rule relative flex flex-col justify-center gap-4 border-b px-4 md:px-24 ${height}`}
        data-stop={index}
        key={role}
      >
        <AgentWaypoint action={action} role={role} side={side} />
        <p className="label text-mist tabular-nums">
          WP-{String(index + 1).padStart(2, "0")} · {side}
        </p>
        <h2 className="display text-5xl md:text-7xl">
          {agentProfiles[role].title}
        </h2>
        <p className="text-graphite max-w-prose text-sm">
          {agentProfiles[role].responsibilities.join(". ")}.
        </p>
        {index === 3 ? (
          <div className="border-rule mt-8 max-w-3xl border">
            <AgentScene
              label="Debugging scene, the companion steps aside while it plays"
              scene="debugging"
            />
          </div>
        ) : null}
      </section>
    ))}
  </div>
);

export default CompanionPage;

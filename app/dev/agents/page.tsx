import type { Metadata } from "next";

import { AgentLineup } from "@/components/agents/agent-lineup";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { agentActions, agentRoles } from "@/lib/agents/roles";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Agent lineup",
};

const isAgentAction = (value: unknown): value is AgentAction =>
  agentActions.some((action) => action === value);

const isAgentRole = (value: unknown): value is AgentRole =>
  agentRoles.some((role) => role === value);

const AgentLineupPage = async ({ searchParams }: PageProps<"/dev/agents">) => {
  const { action, motion, role } = await searchParams;
  return (
    <section className="mx-auto flex w-full max-w-screen-2xl flex-col gap-8 px-4 py-12 md:px-6">
      <header className="flex flex-col gap-3">
        <p className="label text-clay">Dev · Character rig</p>
        <h1 className="display text-5xl md:text-7xl">Agent lineup</h1>
        <p className="text-muted-foreground max-w-prose text-sm">
          One procedural mascot rig with seven accessory kits. Hover an agent
          and it reacts, never the same way twice in a row.
        </p>
      </header>
      <AgentLineup
        initialAction={isAgentAction(action) ? action : "signature"}
        initialMotion={motion === "reduced" ? "reduced" : "full"}
        soloRole={isAgentRole(role) ? role : undefined}
      />
    </section>
  );
};

export default AgentLineupPage;

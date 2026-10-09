import { AgentStatusCard } from "@/registry/ivan/ui/agent-status-card";

export const Example = () => (
  <AgentStatusCard
    agentId="AG-03"
    announce
    className="w-full max-w-md"
    meta={[
      { label: "Elapsed", value: "04:12" },
      { label: "Worktree", value: "wt-registry" },
    ]}
    name="Builder"
    progress={62}
    status="running"
    task="Implementing the registry detail page"
  />
);

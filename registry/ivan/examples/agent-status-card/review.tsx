import { AgentStatusCard } from "@/registry/ivan/ui/agent-status-card";

const actionClassName =
  "inline-flex min-h-11 items-center border border-border px-4 font-mono text-xs tracking-widest uppercase transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export const Example = () => (
  <AgentStatusCard
    agentId="AG-06"
    className="w-full max-w-md"
    footer={
      <div className="flex gap-2">
        <button className={actionClassName} type="button">
          Inspect diff
        </button>
        <button className={actionClassName} type="button">
          Approve
        </button>
      </div>
    }
    name="Inspector"
    progress={100}
    status="review"
    task="Changes ready. Waiting for the owner to review before integration."
  />
);

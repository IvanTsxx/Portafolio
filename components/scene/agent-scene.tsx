import type { AgentSceneId } from "@/lib/agents/scenes";
import { cn } from "@/lib/utils";

export interface AgentSceneProps {
  scene: AgentSceneId;
  label: string;
  className?: string;
}

export const AgentScene = ({ scene, label, className }: AgentSceneProps) => (
  <figure
    aria-label={label}
    className={cn("relative m-0 aspect-4/3 w-full", className)}
    data-agent-scene={scene}
  />
);

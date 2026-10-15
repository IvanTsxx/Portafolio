import type { AgentAction, AgentRole } from "@/lib/agents/roles";

export interface CompanionCast {
  action: AgentAction;
  role: AgentRole;
}

interface RouteCast extends CompanionCast {
  section: string;
}

const homeCast: CompanionCast = { action: "wave", role: "orchestrator" };

const routeCasts: readonly RouteCast[] = [
  { action: "read", role: "researcher", section: "notes" },
  { action: "type", role: "builder", section: "experiments" },
  { action: "inspect", role: "inspector", section: "registry" },
  { action: "measure", role: "architect", section: "design-system" },
];

export const companionCastFor = (pathname: string): CompanionCast => {
  const section = pathname.split("/").find(Boolean) ?? "";
  const match = routeCasts.find((cast) => cast.section === section);
  return match ? { action: match.action, role: match.role } : homeCast;
};

const rigShowcases: readonly (readonly string[])[] = [
  ["registry", "agent"],
  ["registry", "agent-stage"],
];

export const showcasesTheRig = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  return rigShowcases.some(
    (showcase) =>
      showcase.length <= segments.length &&
      showcase.every((segment, index) => segments[index] === segment)
  );
};

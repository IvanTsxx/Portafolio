import { agentProfiles, agentRoles } from "@/lib/agents/roles";
import type { AgentRole } from "@/lib/agents/roles";
import { agentScenes } from "@/lib/agents/scenes";
import type { AgentSceneId } from "@/lib/agents/scenes";

export interface AgentSceneSpec {
  cast: readonly AgentRole[];
  code: string;
  id: AgentSceneId;
  label: string;
}

const sceneDetails = {
  "code-search": {
    cast: ["researcher"],
    code: "SC-02",
    label: "Code search",
  },
  debugging: {
    cast: ["debugger"],
    code: "SC-04",
    label: "Debugging",
  },
  feature: {
    cast: ["builder", "inspector"],
    code: "SC-01",
    label: "Feature",
  },
  "figma-to-code": {
    cast: ["builder"],
    code: "SC-03",
    label: "Figma to code",
  },
} as const satisfies Record<
  AgentSceneId,
  { cast: readonly AgentRole[]; code: string; label: string }
>;

export const agentSceneSpecs: readonly AgentSceneSpec[] = agentScenes
  .map((id) => ({ id, ...sceneDetails[id] }))
  .toSorted((first, second) => first.code.localeCompare(second.code));

export const agentRoleSpecs = agentRoles
  .map((role) => agentProfiles[role])
  .toSorted((first, second) =>
    first.designation.localeCompare(second.designation)
  );

export {
  agentActions as agentActionNames,
  agentReactions as agentReactionNames,
} from "@/lib/agents/roles";

export const agentContract = [
  "One shared Canvas, mounted once in the root layout.",
  "One companion per view. AgentWaypoint marks where it stands.",
  "AgentScene plays an 8 second diorama while visible.",
  "Hover plays a reaction from a shuffled deck, never the same twice.",
  "No WebGL: a static labeled fallback. Reduced motion: held key poses.",
  "No waypoints or scenes on a page, no three.js on that page.",
] as const;

export const agentUsage = [
  '<AgentWaypoint role="builder" action="carry" side="right" />',
  '<AgentScene scene="feature" label="Feature scene: agents at work" />',
  '<Agent role="debugger" action="inspect" motion="reduced" />',
] as const;

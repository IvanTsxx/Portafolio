export const agentRoles = [
  "orchestrator",
  "architect",
  "researcher",
  "builder",
  "debugger",
  "inspector",
  "analyst",
] as const;

export type AgentRole = (typeof agentRoles)[number];

export const agentActions = [
  "idle",
  "wave",
  "walk",
  "type",
  "inspect",
  "point",
  "read",
  "carry",
  "direct",
  "celebrate",
  "measure",
  "check",
] as const;

export type AgentAction = (typeof agentActions)[number];

export const agentRoleLabels = {
  analyst: "Analyst agent",
  architect: "Architect agent",
  builder: "Builder agent",
  debugger: "Debugger agent",
  inspector: "Inspector agent",
  orchestrator: "Orchestrator agent",
  researcher: "Researcher agent",
} as const satisfies Record<AgentRole, string>;

export const agentSignatureActions = {
  analyst: "point",
  architect: "measure",
  builder: "type",
  debugger: "inspect",
  inspector: "check",
  orchestrator: "direct",
  researcher: "read",
} as const satisfies Record<AgentRole, AgentAction>;

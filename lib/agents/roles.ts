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
  "build",
] as const;

export type AgentAction = (typeof agentActions)[number];

export const agentReactions = [
  "wave",
  "jump",
  "spin",
  "look",
  "salute",
  "shuffle",
  "surprised",
  "peek",
] as const;

export type AgentReaction = (typeof agentReactions)[number];

export interface AgentProfile {
  role: AgentRole;
  designation: string;
  title: string;
  kit: readonly string[];
  responsibilities: readonly string[];
  signatureActions: readonly AgentAction[];
}

export const agentProfiles = {
  analyst: {
    designation: "AG-06",
    kit: ["Goggles", "Lab coat", "Pointer"],
    responsibilities: [
      "Explains the number before trusting it",
      "Reviews outcomes against the goal",
      "Writes down the decision trail",
    ],
    role: "analyst",
    signatureActions: ["point", "read", "idle"],
    title: "Analyst",
  },
  architect: {
    designation: "AG-01",
    kit: ["Hard hat", "Blueprint roll", "Tape measure"],
    responsibilities: [
      "Names the data shape before any code",
      "Plans component structure and boundaries",
      "Keeps the design system coherent",
    ],
    role: "architect",
    signatureActions: ["measure", "point", "inspect"],
    title: "Architect",
  },
  builder: {
    designation: "AG-03",
    kit: ["Hard hat", "Safety vest", "Laptop"],
    responsibilities: [
      "Implements components in Next.js and TypeScript",
      "Wires motion with GSAP, Motion and R3F",
      "Carries finished modules into place",
    ],
    role: "builder",
    signatureActions: ["type", "carry", "celebrate"],
    title: "Builder",
  },
  debugger: {
    designation: "AG-04",
    kit: ["Deerstalker", "Magnifying glass"],
    responsibilities: [
      "Reproduces a defect before touching code",
      "Traces symptoms to a root cause",
      "Flags regressions early",
    ],
    role: "debugger",
    signatureActions: ["inspect", "walk", "point"],
    title: "Debugger",
  },
  inspector: {
    designation: "AG-05",
    kit: ["Safety helmet", "Clipboard"],
    responsibilities: [
      "Runs typecheck, lint, tests and build",
      "Checks keyboard, focus and reduced motion",
      "Compares the render against the intent",
    ],
    role: "inspector",
    signatureActions: ["check", "inspect", "celebrate"],
    title: "QA Inspector",
  },
  orchestrator: {
    designation: "AG-00",
    kit: ["Headset", "Control tablet"],
    responsibilities: [
      "Splits a Linear issue into parallel tasks",
      "Opens Conductor workspaces on isolated worktrees",
      "Routes work to specialists and merges results back",
    ],
    role: "orchestrator",
    signatureActions: ["direct", "type", "point"],
    title: "Orchestrator",
  },
  researcher: {
    designation: "AG-02",
    kit: ["Round glasses", "Open book"],
    responsibilities: [
      "Reads current library docs instead of guessing",
      "Maps unfamiliar code before it is changed",
      "Brings back context, not file dumps",
    ],
    role: "researcher",
    signatureActions: ["read", "inspect", "idle"],
    title: "Researcher",
  },
} as const satisfies Record<AgentRole, AgentProfile>;

import type { AgentAction, AgentRole, WaypointSide } from "@/lib/agents/roles";
import { agentRoles } from "@/lib/agents/roles";

import { siteConfig } from "./config";
import { experience, formatMonth } from "./experience";
import { workSteps } from "./practice";

export type SectionReveal = "build" | "static";

export interface SectionScript {
  action: AgentAction;
  lines: readonly string[];
  reveal: SectionReveal;
  role: AgentRole;
  side: WaypointSide;
}

const jobsOldestFirst = experience.toSorted((first, second) =>
  first.start.localeCompare(second.start)
);

const currentJobLines = experience.flatMap((job) =>
  job.end === null
    ? [`${job.role} at ${job.company} since ${formatMonth(job.start)}.`]
    : []
);

const pastJobLines = jobsOldestFirst
  .filter((job) => job.end !== null && job.stack.length > 0)
  .toReversed()
  .map((job) => `${job.company}: ${job.stack.join(" · ")}.`);

const firstYear = jobsOldestFirst[0]?.start.slice(0, 4) ?? "";

const spokenSteps = new Set<string>(["orchestrate", "build"]);

const workStepLines = workSteps.flatMap((step) =>
  spokenSteps.has(step.id) ? [step.summary] : []
);

const builds = (
  role: AgentRole,
  lines: readonly string[] = [],
  side: WaypointSide = "right"
): SectionScript => ({ action: "build", lines, reveal: "build", role, side });

const watches = (
  role: AgentRole,
  action: AgentAction,
  side: WaypointSide
): SectionScript => ({ action, lines: [], reveal: "static", role, side });

export const sectionScripts = {
  designColor: builds("architect"),
  designMotion: builds("builder"),
  designPhilosophy: builds("architect"),
  designSpacing: builds("architect"),
  designTypography: builds("builder"),
  designUtilities: builds("builder"),
  homeContact: {
    action: "wave",
    lines: [`Say hi at ${siteConfig.email}.`],
    reveal: "static",
    role: "orchestrator",
    side: "right",
  },
  homeExperience: builds("builder", [
    `${experience.length} roles since ${firstYear}.`,
    ...pastJobLines,
  ]),
  homeHowIWork: builds("orchestrator", workStepLines),
  homeIntro: {
    action: "wave",
    lines: [`From ${siteConfig.location}.`, ...currentJobLines],
    reveal: "static",
    role: "orchestrator",
    side: "right",
  },
  homeMatrix: builds("analyst", [
    `A year of commits from @${siteConfig.handle} on GitHub.`,
  ]),
  homePinned: builds("builder", [`Pinned on github.com/${siteConfig.github}.`]),
  homeWorkshop: builds("inspector", [
    `${agentRoles.length} agents, one per role.`,
  ]),
  labExperiments: builds("builder"),
  labPreview: watches("builder", "type", "left"),
  noteResponsibilities: watches("researcher", "inspect", "right"),
  noteText: watches("researcher", "read", "right"),
  notesArchive: builds("researcher"),
  registryComponents: builds("builder"),
  registryInstall: builds("builder", [
    `Install from ${siteConfig.registryNamespace}.`,
  ]),
  registryPreview: watches("inspector", "inspect", "left"),
} as const satisfies Record<string, SectionScript>;

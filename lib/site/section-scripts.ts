import { agentRoles } from "@/lib/agents/roles";

import { siteConfig } from "./config";
import { experience, formatMonth } from "./experience";
import { workSteps } from "./practice";

export type SectionReveal = "build" | "static";

export interface SectionScript {
  lines: readonly string[];
  reveal: SectionReveal;
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

const builds = (lines: readonly string[] = []): SectionScript => ({
  lines,
  reveal: "build",
});

const speaks = (lines: readonly string[] = []): SectionScript => ({
  lines,
  reveal: "static",
});

export const sectionScripts = {
  designColor: builds(),
  designMotion: builds(),
  designPhilosophy: builds(),
  designSpacing: builds(),
  designTypography: builds(),
  designUtilities: builds(),
  homeContact: speaks([`Say hi at ${siteConfig.email}.`]),
  homeExperience: builds([
    `${experience.length} roles since ${firstYear}.`,
    ...pastJobLines,
  ]),
  homeExperiments: builds(["Shaders, dithers and dot grids I build to learn."]),
  homeHowIWork: builds(workStepLines),
  homeIntro: speaks([`From ${siteConfig.location}.`, ...currentJobLines]),
  homeMatrix: builds([
    `A year of commits from @${siteConfig.handle} on GitHub.`,
  ]),
  homePinned: builds([`Pinned on github.com/${siteConfig.github}.`]),
  homeWorkshop: builds([`${agentRoles.length} agents, one per role.`]),
  labExperiments: builds(),
  labPreview: speaks(),
  noteResponsibilities: speaks(),
  noteText: speaks(),
  notesArchive: builds(),
  registryComponents: builds(),
  registryInstall: builds([`Install from ${siteConfig.registryNamespace}.`]),
  registryPreview: speaks(),
} as const satisfies Record<string, SectionScript>;

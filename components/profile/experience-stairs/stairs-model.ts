import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import type { Experience } from "@/lib/site/experience";
import { experience, formatMonth } from "@/lib/site/experience";

type ExperienceId = (typeof experience)[number]["id"];

export interface StairCast {
  action: AgentAction;
  role: AgentRole;
}

const stairCasts = {
  "aliva-shop": { action: "measure", role: "architect" },
  "basement-studio": { action: "direct", role: "orchestrator" },
  "doctor-qali": { action: "type", role: "builder" },
  tensolite: { action: "check", role: "inspector" },
} as const satisfies Record<ExperienceId, StairCast>;

const casts = new Map<string, StairCast>(Object.entries(stairCasts));

export interface Stair {
  cast: StairCast;
  company: string;
  dates: string;
  id: string;
  isCurrent: boolean;
  logo: string;
  role: string;
  type: Experience["type"];
  website: string | null;
  year: string;
}

export const formatDates = (start: string, end: string | null) =>
  `${formatMonth(start)} → ${end ? formatMonth(end) : "now"}`;

export const buildStairs = (jobs: readonly Experience[]): Stair[] =>
  jobs
    .toSorted((first, second) => first.start.localeCompare(second.start))
    .map((job) => ({
      cast: casts.get(job.id) ?? stairCasts["doctor-qali"],
      company: job.company,
      dates: formatDates(job.start, job.end),
      id: job.id,
      isCurrent: job.end === null,
      logo: job.logo,
      role: job.role,
      type: job.type,
      website: job.website,
      year: job.start.slice(0, 4),
    }));

export const stairs = buildStairs(experience);

export const stepAtProgress = (progress: number, count: number) =>
  Math.min(count - 1, Math.max(0, Math.floor(progress * count)));

export const progressOfStep = (index: number, count: number) =>
  Math.min(1, (index + 0.5) / count);

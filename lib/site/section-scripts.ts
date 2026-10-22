import { siteConfig } from "./config";
import { experience } from "./experience";

export type SectionReveal = "build" | "static";

export interface SectionScript {
  lines: readonly string[];
  reveal: SectionReveal;
}

const countWords = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
] as const;

const spelled = (count: number) => countWords[count] ?? String(count);

const firstYear = experience
  .map((job) => job.start.slice(0, 4))
  .toSorted()
  .at(0);

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
  designComponents: builds(),
  designMotion: builds(),
  designPhilosophy: builds(),
  designSpacing: builds(),
  designTypography: builds(),
  designUtilities: builds(),
  homeExperience: builds([
    `Laying out ${spelled(experience.length)} roles since ${firstYear}.`,
  ]),
  homeExperiments: builds(["Unpacking what Ivo builds to learn."]),
  homeHowIWork: builds(["I play every step here. Ivo calls the shots."]),
  homeIntro: speaks([
    "Opening Ivo's file.",
    "I build each section as you reach it.",
  ]),
  homeMatrix: builds(["I wrote most of these commits."]),
  homeRegistry: builds(["Stocking parts you can install."]),
  homeRepos: builds(["Stacking the tapes Ivo is proud of."]),
  homeWorkshop: builds([
    "My fitting room. Dress me up.",
    "The link keeps the look.",
  ]),
  labExperiments: builds(["Shelving Ivo's experiments."]),
  labPreview: speaks(),
  noteResponsibilities: speaks(),
  noteText: speaks(),
  notesArchive: builds(["Filing the notes."]),
  registryComponents: builds([
    "Stocking the shelf.",
    `Every piece installs from ${siteConfig.registryNamespace}.`,
  ]),
  registryPreview: speaks(),
  skillInstructions: speaks(["I follow these steps when this skill loads."]),
  skillsCatalog: builds(["Shelving the skills I load on the job."]),
} as const satisfies Record<string, SectionScript>;

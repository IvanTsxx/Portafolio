import { isIndexable } from "@/lib/content/metadata";
import { notePath, noteSource } from "@/lib/content/note-domain";
import { getNotes } from "@/lib/content/notes";
import { experiments } from "@/lib/lab/experiments";
import { registryItems } from "@/lib/registry/registry";
import { skills } from "@/lib/skills/skills";

import routeDates from "./route-dates.json";
import { experimentPath, registryItemPath, skillPath } from "./seo";

export interface PublicRoute {
  path: `/${string}`;
  sources: readonly string[];
}

const indexRoutes: Record<`/${string}`, readonly string[]> = {
  "/": [
    "app/(document)/page.tsx",
    "components/home",
    "lib/site/config.ts",
    "lib/site/experience.ts",
  ],
  "/design-system": [
    "app/(document)/design-system",
    "app/globals.css",
    "components/design-system",
    "lib/design-system",
  ],
  "/experiments": ["app/(document)/experiments", "components/lab", "lib/lab"],
  "/notes": ["app/(document)/notes", "components/content", "content/notes"],
  "/registry": [
    "app/(document)/registry",
    "components/registry-docs",
    "registry.json",
  ],
  "/skills": ["app/(document)/skills", "components/skills", "skills"],
};

const indexPaths = Object.keys(indexRoutes).filter(
  (path): path is `/${string}` => path.startsWith("/")
);

export const getPublicRoutes = async (): Promise<PublicRoute[]> => {
  const notes = await getNotes();
  return [
    ...indexPaths.map((path) => ({ path, sources: indexRoutes[path] ?? [] })),
    ...notes.flatMap((note) =>
      isIndexable(note)
        ? [{ path: notePath(note.slug), sources: [noteSource(note.slug)] }]
        : []
    ),
    ...experiments.map((experiment) => ({
      path: experimentPath(experiment.slug),
      sources: [
        `components/lab/experiments/${experiment.slug}`,
        "lib/lab/experiments.ts",
      ],
    })),
    ...registryItems.map((item) => ({
      path: registryItemPath(item.name),
      sources: item.files.map((file) => file.path),
    })),
    ...skills.map((skill) => ({
      path: skillPath(skill.name),
      sources: [`skills/${skill.name}`],
    })),
  ];
};

const lastModifiedByPath: Readonly<Record<string, string>> = routeDates;

export const lastModifiedOf = (path: string) => lastModifiedByPath[path];

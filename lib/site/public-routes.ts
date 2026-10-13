import { isIndexable } from "@/lib/content/metadata";
import { notePath, noteSource } from "@/lib/content/note-domain";
import { getNotes } from "@/lib/content/notes";
import { experiments } from "@/lib/lab/experiments";
import { registryItems } from "@/lib/registry/registry";

import { primaryRoutes } from "./config";
import type { PrimaryRoute } from "./config";
import routeDates from "./route-dates.json";
import { experimentPath, registryItemPath } from "./seo";

export interface PublicRoute {
  path: `/${string}`;
  sources: readonly string[];
}

const primarySources: Record<PrimaryRoute["href"], readonly string[]> = {
  "/": [
    "app/(document)/page.tsx",
    "components/profile",
    "lib/site/config.ts",
    "lib/site/experience.ts",
  ],
  "/design-system": [
    "app/(document)/design-system",
    "app/globals.css",
    "components/design-system",
    "lib/design-system",
  ],
  "/lab": ["app/(document)/lab", "components/lab", "lib/lab"],
  "/notes": ["app/(document)/notes", "components/content", "content/notes"],
  "/registry": [
    "app/(document)/registry",
    "components/registry-docs",
    "registry.json",
  ],
};

export const getPublicRoutes = async (): Promise<PublicRoute[]> => {
  const notes = await getNotes();
  return [
    ...primaryRoutes.map((route) => ({
      path: route.href,
      sources: primarySources[route.href],
    })),
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
  ];
};

const lastModifiedByPath: Readonly<Record<string, string>> = routeDates;

export const lastModifiedOf = (path: string) => lastModifiedByPath[path];

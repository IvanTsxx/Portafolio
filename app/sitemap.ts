import type { MetadataRoute } from "next";

import { absoluteUrl, isIndexable } from "@/lib/content/metadata";
import { notePath } from "@/lib/content/note-domain";
import { getNotes } from "@/lib/content/notes";
import { primaryRoutes } from "@/lib/site/config";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const notes = await getNotes();

  return [
    ...primaryRoutes.map((route) => ({
      priority: route.href === "/" ? 1 : 0.8,
      url: absoluteUrl(route.href),
    })),
    ...notes.flatMap((note) =>
      isIndexable(note)
        ? [
            {
              lastModified: note.kind === "note" ? note.date : undefined,
              priority: 0.6,
              url: absoluteUrl(notePath(note.slug)),
            },
          ]
        : []
    ),
  ];
};

export default sitemap;

import { notePath } from "@/lib/content/note-domain";
import { getNotes } from "@/lib/content/notes";
import { experiments } from "@/lib/lab/experiments";
import { capabilities } from "@/lib/site/capabilities";
import { experience } from "@/lib/site/experience";
import { experimentPath } from "@/lib/site/seo";

export interface HomeRow {
  description?: string;
  external?: boolean;
  href: string;
  meta: string;
  title: string;
}

export interface HomeSectionData {
  facts: readonly string[];
  id: "lab" | "skills" | "work" | "writing";
  label: string;
  more?: { href: string; label: string };
  phase: number;
  rows: readonly HomeRow[];
}

const yearOf = (stamp: string) => stamp.split("-")[0] ?? stamp;

export const getHomeSections = async (): Promise<
  readonly HomeSectionData[]
> => {
  const notes = await getNotes();
  const writingRows = notes.flatMap((note) =>
    note.kind === "note"
      ? [
          {
            description: note.summary,
            href: notePath(note.slug),
            meta: note.date.slice(0, 7).replace("-", "."),
            title: note.title,
          },
        ]
      : []
  );
  const firstRole = experience.at(-1);
  return [
    {
      facts: [
        `${experience.length} roles`,
        `Since ${yearOf(firstRole?.start ?? "2023")}`,
      ],
      id: "work",
      label: "Work",
      phase: 0.25,
      rows: experience.map((entry) => ({
        description: entry.role,
        external: Boolean(entry.website),
        href: entry.website ?? "/",
        meta: `${yearOf(entry.start)}–${entry.end ? yearOf(entry.end) : "Now"}`,
        title: entry.company,
      })),
    },
    {
      facts: [`${experiments.length} experiments`, "All installable"],
      id: "lab",
      label: "Lab",
      more: { href: "/experiments", label: "Open the lab" },
      phase: 0.4,
      rows: experiments
        .toSorted((first, second) => second.index.localeCompare(first.index))
        .map((experiment) => ({
          description: experiment.summary,
          href: experimentPath(experiment.slug),
          meta: experiment.index,
          title: experiment.title,
        })),
    },
    {
      facts: [`${writingRows.length} published`],
      id: "writing",
      label: "Writing",
      more: { href: "/notes", label: "All writing" },
      phase: 0.5,
      rows: writingRows,
    },
    {
      facts: ["No percentages", "Each links to evidence"],
      id: "skills",
      label: "Skills",
      more: { href: "/skills", label: "Agent skills" },
      phase: 0.65,
      rows: capabilities.map((capability) => ({
        description: capability.tools.join(", "),
        href: capability.evidence[0]?.href ?? "/skills",
        meta: `${capability.tools.length} tools`,
        title: capability.label,
      })),
    },
  ];
};

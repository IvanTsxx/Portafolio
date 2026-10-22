import Link from "next/link";

import { CornerMarks } from "@/components/site/corner-marks";
import { DocumentSection } from "@/components/site/document-section";
import { hoverRowClassName } from "@/components/site/styles";
import { sectionScripts } from "@/lib/site/section-scripts";
import { skillPath } from "@/lib/site/seo";
import { formatSkillIndex } from "@/lib/skills/skills";
import type { Skill } from "@/lib/skills/skills";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

const SkillRow = ({ position, skill }: { position: number; skill: Skill }) => (
  <li
    className={cn(
      "group/marks border-graphite/30 relative grid gap-3 border-b px-4 py-5 md:grid-cols-12 md:gap-6 md:px-5",
      hoverRowClassName
    )}
    data-build-block
  >
    <CornerMarks reveal="hover" />
    <span className="label text-mist tabular-nums md:col-span-2">
      {formatSkillIndex(position)}
    </span>
    <div className="flex min-w-0 flex-col gap-2 md:col-span-7">
      <h3 className="text-ink text-xl font-light tracking-tight">
        <Link
          className="outline-none after:absolute after:inset-0"
          href={skillPath(skill.name)}
        >
          {skill.name}
        </Link>
      </h3>
      <p className="text-graphite line-clamp-2 text-sm text-pretty">
        {skill.description}
      </p>
    </div>
    <dl className="label flex flex-wrap gap-x-6 gap-y-1 md:col-span-3 md:flex-col md:items-end">
      {skill.metadata?.version ? (
        <div className="flex gap-2">
          <dt className="text-mist">Version</dt>
          <dd className="text-ink tabular-nums">{skill.metadata.version}</dd>
        </div>
      ) : null}
      <div className="flex gap-2">
        <dt className="text-mist">Files</dt>
        <dd className="text-ink tabular-nums">{pad(skill.files.length)}</dd>
      </div>
    </dl>
  </li>
);

export const SkillList = ({ skills }: { skills: readonly Skill[] }) => (
  <DocumentSection
    aside={pad(skills.length)}
    id="catalog"
    index="SKL-02"
    label="Catalog"
    script={sectionScripts.skillsCatalog}
  >
    <ul className="border-graphite/30 border-t">
      {skills.map((skill, position) => (
        <SkillRow key={skill.name} position={position} skill={skill} />
      ))}
    </ul>
  </DocumentSection>
);

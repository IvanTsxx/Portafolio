import Link from "next/link";

import { focusRingClassName } from "@/components/site/styles";
import { skillPath } from "@/lib/site/seo";
import { formatSkillIndex } from "@/lib/skills/skills";
import type { Skill } from "@/lib/skills/skills";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

const SkillRow = ({ position, skill }: { position: number; skill: Skill }) => (
  <li className="border-border border-b">
    <Link
      className={cn(
        "group/row grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-4 md:grid-cols-[3rem_14rem_1fr_auto] md:gap-x-6",
        focusRingClassName
      )}
      href={skillPath(skill.name)}
    >
      <span className="label text-faint tabular-nums">
        {formatSkillIndex(position)}
      </span>
      <span className="text-foreground ease-out-expo truncate font-mono text-sm transition-transform duration-500 group-hover/row:translate-x-1">
        {skill.name}
      </span>
      <span className="text-muted-foreground col-span-2 col-start-2 truncate text-sm md:col-span-1 md:col-start-auto">
        {skill.description.replace(/^Trigger:\s*/u, "")}
      </span>
      <span className="label text-faint row-start-1 text-right tabular-nums md:row-start-auto">
        {skill.metadata?.version ? `v${skill.metadata.version} · ` : ""}
        {pad(skill.files.length)} files
      </span>
    </Link>
  </li>
);

export const SkillList = ({ skills }: { skills: readonly Skill[] }) => (
  <ul className="border-border border-t">
    {skills.map((skill, position) => (
      <SkillRow key={skill.name} position={position} skill={skill} />
    ))}
  </ul>
);

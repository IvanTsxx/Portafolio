import Link from "next/link";

import { CommandLine } from "@/components/registry-docs/command-line";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { focusRingClassName } from "@/components/site/styles";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";
import { skillPath } from "@/lib/site/seo";
import { getSkillInstallCommand, skillPlaceholder } from "@/lib/skills/install";
import { formatSkillIndex, skills } from "@/lib/skills/skills";
import { cn } from "@/lib/utils";

const skillLinkClassName = cn(
  "label text-ink inline-flex min-h-11 items-center gap-2",
  focusRingClassName
);

export const SkillsSection = () => {
  const section = homeSectionById("skills");
  return (
    <DocumentSection
      aside={<PanelCount current={skills.length} total={skills.length} />}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeSkills}
    >
      <div className="flex flex-col gap-2">
        <div data-build-block>
          <CommandLine command={getSkillInstallCommand(skillPlaceholder)} />
        </div>
        <ul className="flex flex-wrap items-center gap-x-6" data-build-block>
          {skills.map((skill, position) => (
            <li key={skill.name}>
              <Link className={skillLinkClassName} href={skillPath(skill.name)}>
                <span className="text-mist tabular-nums">
                  {formatSkillIndex(position)}
                </span>
                <span className="ink-underline">{skill.name}</span>
              </Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link className={skillLinkClassName} href="/skills">
              <span className="ink-underline">All skills</span> →
            </Link>
          </li>
        </ul>
      </div>
    </DocumentSection>
  );
};

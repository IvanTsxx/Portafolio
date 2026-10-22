import Link from "next/link";

import { CommandLine } from "@/components/registry-docs/command-line";
import { CornerMarks } from "@/components/site/corner-marks";
import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { focusRingClassName } from "@/components/site/styles";
import { SkillRow } from "@/components/skills/skill-list";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";
import { getSkillInstallCommand, skillPlaceholder } from "@/lib/skills/install";
import { skills } from "@/lib/skills/skills";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col gap-6">
        <div data-build-block>
          <CommandLine command={getSkillInstallCommand(skillPlaceholder)} />
        </div>
        <ul className="border-graphite/30 border-t">
          {skills.map((skill, position) => (
            <SkillRow key={skill.name} position={position} skill={skill} />
          ))}
        </ul>
        <Link
          className={cn(
            "group/marks label text-ink relative inline-flex min-h-11 items-center gap-1 self-start px-1",
            focusRingClassName
          )}
          data-build-block
          href="/skills"
        >
          <CornerMarks reveal="hover" />
          <span className="ink-underline">All skills</span> →
        </Link>
      </div>
    </DocumentSection>
  );
};

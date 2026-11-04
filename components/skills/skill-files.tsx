import { ManifestList } from "@/components/site/manifest-list";
import { siteConfig } from "@/lib/site/config";
import { fileEntry } from "@/lib/site/manifest";
import type { Skill } from "@/lib/skills/skills";

const sourceUrlOf = (skill: Skill, file: string) =>
  `https://github.com/${siteConfig.repository}/blob/main/skills/${skill.name}/${file}`;

export const SkillFiles = ({ skill }: { skill: Skill }) => (
  <ManifestList
    entries={skill.files.map((file) =>
      fileEntry(file, sourceUrlOf(skill, file))
    )}
  />
);

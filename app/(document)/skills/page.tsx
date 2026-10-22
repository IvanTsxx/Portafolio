import { CommandLine } from "@/components/registry-docs/command-line";
import { DocumentHero } from "@/components/site/document-hero";
import { JsonLd } from "@/components/site/json-ld";
import { SkillList } from "@/components/skills/skill-list";
import { buildPageMetadata, pageSeo } from "@/lib/site/seo";
import { skillsIndexJsonLd } from "@/lib/site/structured-data";
import {
  getSkillInstallCommand,
  installScopes,
  skillPlaceholder,
} from "@/lib/skills/install";
import { skills } from "@/lib/skills/skills";

export const metadata = buildPageMetadata(pageSeo.skills);

const SkillsPage = () => (
  <>
    <JsonLd data={skillsIndexJsonLd(skills)} />
    <DocumentHero
      code="SKL-01"
      jp="スキル"
      lede="Install with one command"
      meta={[
        { label: "Skills", value: String(skills.length).padStart(2, "0") },
      ]}
      title="Skills"
    >
      <div className="flex w-full flex-col gap-2">
        {installScopes.map((scope) => (
          <CommandLine
            command={getSkillInstallCommand(skillPlaceholder, scope.id)}
            key={scope.id}
          />
        ))}
      </div>
    </DocumentHero>
    <SkillList skills={skills} />
  </>
);

export default SkillsPage;

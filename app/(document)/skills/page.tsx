import { CommandLine } from "@/components/registry-docs/command-line";
import { DocumentHero } from "@/components/site/document-hero";
import { DocumentSection } from "@/components/site/document-section";
import { JsonLd } from "@/components/site/json-ld";
import { PlatePage } from "@/components/site/plate-page";
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

const pad = (value: number) => String(value).padStart(2, "0");

const SkillsPage = () => (
  <>
    <JsonLd data={skillsIndexJsonLd(skills)} />
    <PlatePage
      plate={
        <DocumentHero
          code="Index · Skills"
          lede="How I work with coding agents, packaged as Agent Skills for Claude Code, Codex and other agents. Install one with a single command."
          meta={[{ label: "Skills", value: pad(skills.length) }]}
          title={
            <>
              Agent <em>skills</em>
            </>
          }
        >
          <div className="flex w-full max-w-2xl flex-col gap-2">
            {installScopes.map((scope) => (
              <CommandLine
                command={getSkillInstallCommand(skillPlaceholder, scope.id)}
                key={scope.id}
              />
            ))}
          </div>
        </DocumentHero>
      }
    >
      <DocumentSection
        aside={pad(skills.length)}
        id="catalog"
        index="01"
        label="Catalog"
      >
        <SkillList skills={skills} />
      </DocumentSection>
    </PlatePage>
  </>
);

export default SkillsPage;

import type { Metadata } from "next";

import { TableOfContents } from "@/components/content/table-of-contents";
import { AgentsSection } from "@/components/design-system/agents-section";
import { ColorSection } from "@/components/design-system/color-section";
import { ComponentsSection } from "@/components/design-system/components-section";
import { ExportActions } from "@/components/design-system/export-actions";
import { MotionSection } from "@/components/design-system/motion-section";
import { PhilosophySection } from "@/components/design-system/philosophy-section";
import { PrimitivesSection } from "@/components/design-system/primitives-section";
import { SpacingSection } from "@/components/design-system/spacing-section";
import { padCount } from "@/components/design-system/spec-frame";
import { TypographySection } from "@/components/design-system/typography-section";
import { UtilitiesSection } from "@/components/design-system/utilities-section";
import {
  CompactDossier,
  DossierPanel,
} from "@/components/site/compact-dossier";
import { DocumentHero } from "@/components/site/document-hero";
import { DocumentLayout } from "@/components/site/document-layout";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { linkClassName } from "@/components/site/styles";
import { allComponentSpecs } from "@/lib/design-system/catalog";
import { renderDesignMarkdown } from "@/lib/design-system/design-md";
import { loadDesignSystem } from "@/lib/design-system/load";
import {
  documentCode,
  rawMarkdownPath,
  sectionSpecs,
} from "@/lib/design-system/sections";

const description =
  "Paper-and-ink design system: tokens, type, utilities, components, motion and 3D agents. Copy it as design.md.";

export const metadata: Metadata = {
  alternates: { canonical: "/design-system" },
  description,
  title: "Design system",
};

const bytesPerKilobyte = 1024;

const DesignSystemPage = async () => {
  const system = await loadDesignSystem();
  const markdown = renderDesignMarkdown(system);
  const kilobytes = (
    new TextEncoder().encode(markdown).length / bytesPerKilobyte
  ).toFixed(1);

  return (
    <DocumentLayout
      dossier={
        <CompactDossier code={documentCode}>
          <DossierPanel collapsible jp="目次" label="On this page">
            <TableOfContents
              headings={sectionSpecs.map((section) => ({
                depth: 2,
                id: section.id,
                text: section.label,
              }))}
            />
          </DossierPanel>
          <DossierPanel collapsible jp="出力" label="Export">
            <LeaderList>
              <LeaderRow jp="形式" label="Format">
                Markdown
              </LeaderRow>
              <LeaderRow jp="容量" label="Size">
                {kilobytes} KB
              </LeaderRow>
              <LeaderRow jp="行数" label="Lines">
                {markdown.split("\n").length}
              </LeaderRow>
              <LeaderRow jp="原文" label="Raw">
                <a className={linkClassName} href={rawMarkdownPath}>
                  {rawMarkdownPath}
                </a>
              </LeaderRow>
            </LeaderList>
          </DossierPanel>
        </CompactDossier>
      }
      dossierLabel="Design system index"
      hero={
        <DocumentHero
          code={documentCode}
          jp="設計"
          lede="Tokens, parts, motion, agents"
          meta={[
            { label: "Tokens", value: padCount(system.colors.length) },
            { label: "Parts", value: padCount(allComponentSpecs.length) },
          ]}
          title="Design system"
          waypoint={{ action: "measure", role: "architect", side: "right" }}
        >
          <ExportActions
            filename="design.md"
            href={rawMarkdownPath}
            markdown={markdown}
          />
        </DocumentHero>
      }
    >
      <PhilosophySection />
      <ColorSection colors={system.colors} />
      <TypographySection fonts={system.fonts} textLabel={system.textLabel} />
      <SpacingSection radius={system.radius} />
      <UtilitiesSection utilities={system.utilities} />
      <PrimitivesSection />
      <ComponentsSection />
      <MotionSection system={system} />
      <AgentsSection />
    </DocumentLayout>
  );
};

export default DesignSystemPage;

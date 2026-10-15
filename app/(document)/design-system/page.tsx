import { ColorSection } from "@/components/design-system/color-section";
import { ComponentsSection } from "@/components/design-system/components-section";
import { ExportActions } from "@/components/design-system/export-actions";
import { MotionSection } from "@/components/design-system/motion-section";
import { PhilosophySection } from "@/components/design-system/philosophy-section";
import { SpacingSection } from "@/components/design-system/spacing-section";
import { TypographySection } from "@/components/design-system/typography-section";
import { UtilitiesSection } from "@/components/design-system/utilities-section";
import { DocumentHero } from "@/components/site/document-hero";
import { JsonLd } from "@/components/site/json-ld";
import { padCount } from "@/lib/design-system/format";
import { loadDesignMarkdown, loadDesignSystem } from "@/lib/design-system/load";
import { documentCode, rawMarkdownPath } from "@/lib/design-system/sections";
import { buildPageMetadata, pageSeo } from "@/lib/site/seo";
import { designSystemJsonLd } from "@/lib/site/structured-data";

export const metadata = buildPageMetadata(pageSeo.designSystem);

const DesignSystemPage = () => {
  const system = loadDesignSystem();
  const markdown = loadDesignMarkdown();

  return (
    <>
      <JsonLd data={designSystemJsonLd()} />
      <DocumentHero
        code={documentCode}
        jp="設計"
        lede="Foundations, tokens, style"
        meta={[{ label: "Tokens", value: padCount(system.colors.length) }]}
        title="Design system"
      >
        <ExportActions
          filename="DESIGN.md"
          href={rawMarkdownPath}
          markdown={markdown}
        />
      </DocumentHero>
      <PhilosophySection />
      <ColorSection colors={system.colors} />
      <TypographySection fonts={system.fonts} />
      <SpacingSection radius={system.radius} />
      <MotionSection system={system} />
      <UtilitiesSection utilities={system.utilities} />
      <ComponentsSection />
    </>
  );
};

export default DesignSystemPage;

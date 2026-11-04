import { ColorSection } from "@/components/design-system/color-section";
import { ComponentsSection } from "@/components/design-system/components-section";
import { ExportActions } from "@/components/design-system/export-actions";
import { LayoutSection } from "@/components/design-system/layout-section";
import { MotionSection } from "@/components/design-system/motion-section";
import { PrinciplesSection } from "@/components/design-system/principles-section";
import { TypographySection } from "@/components/design-system/typography-section";
import { DocumentHero } from "@/components/site/document-hero";
import { JsonLd } from "@/components/site/json-ld";
import { PlatePage } from "@/components/site/plate-page";
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
      <PlatePage
        plate={
          <DocumentHero
            code={documentCode}
            lede="What the site uses: color, type, layout, motion and components."
            title="Design system"
          >
            <ExportActions
              filename="DESIGN.md"
              href={rawMarkdownPath}
              markdown={markdown}
            />
          </DocumentHero>
        }
      >
        <PrinciplesSection />
        <ColorSection colors={system.colors} />
        <TypographySection fonts={system.fonts} typeScale={system.typeScale} />
        <LayoutSection system={system} />
        <MotionSection system={system} />
        <ComponentsSection />
      </PlatePage>
    </>
  );
};

export default DesignSystemPage;

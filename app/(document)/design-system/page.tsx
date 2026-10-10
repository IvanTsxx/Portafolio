import type { Metadata } from "next";

import { AgentsSection } from "@/components/design-system/agents-section";
import { ColorSection } from "@/components/design-system/color-section";
import { ComponentsSection } from "@/components/design-system/components-section";
import { MotionSection } from "@/components/design-system/motion-section";
import { PhilosophySection } from "@/components/design-system/philosophy-section";
import { PrimitivesSection } from "@/components/design-system/primitives-section";
import { SpacingSection } from "@/components/design-system/spacing-section";
import { TypographySection } from "@/components/design-system/typography-section";
import { UtilitiesSection } from "@/components/design-system/utilities-section";
import { DocumentHero } from "@/components/site/document-hero";
import { allComponentSpecs } from "@/lib/design-system/catalog";
import { padCount } from "@/lib/design-system/format";
import { loadDesignSystem } from "@/lib/design-system/load";
import { documentCode } from "@/lib/design-system/sections";

const description =
  "Paper-and-ink design system: tokens, type, utilities, components, motion and 3D agents. Copy it as design.md.";

export const metadata: Metadata = {
  alternates: { canonical: "/design-system" },
  description,
  title: "Design system",
};

const DesignSystemPage = async () => {
  const system = await loadDesignSystem();

  return (
    <>
      <DocumentHero
        code={documentCode}
        jp="設計"
        lede="Tokens, parts, motion, agents"
        meta={[
          { label: "Tokens", value: padCount(system.colors.length) },
          { label: "Parts", value: padCount(allComponentSpecs.length) },
        ]}
        title="Design system"
      />
      <PhilosophySection />
      <ColorSection colors={system.colors} />
      <TypographySection fonts={system.fonts} textLabel={system.textLabel} />
      <SpacingSection radius={system.radius} />
      <UtilitiesSection utilities={system.utilities} />
      <PrimitivesSection />
      <ComponentsSection />
      <MotionSection system={system} />
      <AgentsSection />
    </>
  );
};

export default DesignSystemPage;

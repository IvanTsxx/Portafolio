import { DocumentSection } from "@/components/site/document-section";
import { padCount } from "@/lib/design-system/format";
import type { FontFamily, TypeStep } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import type { FontClassName } from "@/lib/design-system/specs";
import { cn } from "@/lib/utils";

import { ClassTag, SpecList, SubHeading } from "./spec-list";

const familySampleClassNames = {
  "font-mono": "font-mono text-2xl tracking-tight",
  "font-sans": "font-sans text-2xl tracking-tight text-balance",
  "font-serif": "display text-5xl",
  "font-signature": "font-signature text-signal text-6xl leading-none",
} as const satisfies Record<FontClassName, string>;

const FamilyRow = ({ font }: { font: FontFamily }) => (
  <li className="border-border flex flex-col gap-3 border-b py-4">
    <p className="label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span className="text-foreground normal-case">{font.name}</span>
      <span className="text-faint normal-case">{font.role}</span>
    </p>
    <p
      className={cn("text-foreground", familySampleClassNames[font.className])}
    >
      {font.sample}
    </p>
    <ClassTag className="self-start">{font.className}</ClassTag>
  </li>
);

const ScaleRow = ({ step }: { step: TypeStep }) => (
  <li className="border-border flex flex-col gap-3 border-b py-4">
    <p className="label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span className="text-muted-foreground break-words normal-case">
        {step.className}
      </span>
      <span className="text-faint normal-case tabular-nums">
        {step.size}px · {step.use}
        {step.detail ? ` · ${step.detail}` : ""}
      </span>
    </p>
    <p className={cn("text-foreground", step.className)}>{step.sample}</p>
  </li>
);

export const TypographySection = ({
  fonts,
  typeScale,
}: {
  fonts: readonly FontFamily[];
  typeScale: readonly TypeStep[];
}) => {
  const section = sectionById("type");
  return (
    <DocumentSection
      aside={`${padCount(fonts.length)} families`}
      id={section.id}
      index={section.index}
      label={section.label}
    >
      <div className="flex flex-col gap-3">
        <SubHeading label="Families" />
        <SpecList>
          {fonts.map((font) => (
            <FamilyRow font={font} key={font.className} />
          ))}
        </SpecList>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Scale" />
        <SpecList>
          {typeScale.map((step) => (
            <ScaleRow key={step.className} step={step} />
          ))}
        </SpecList>
      </div>
    </DocumentSection>
  );
};

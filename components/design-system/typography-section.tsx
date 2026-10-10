import { DocumentSection } from "@/components/site/document-section";
import { padCount } from "@/lib/design-system/format";
import type { FontFamily, TextLabelToken } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import { typeScaleSpecs } from "@/lib/design-system/specs";
import type { FontClassName } from "@/lib/design-system/specs";
import { cn } from "@/lib/utils";

import { ClassTag, SpecCell, SpecGrid, SubHeading } from "./spec-frame";

const familySampleClassNames = {
  "font-jp": "jp text-3xl font-light",
  "font-mono": "font-mono text-2xl font-light tracking-tight",
  "font-sans": "font-sans text-3xl font-light tracking-tight",
  "font-wordmark": "font-wordmark text-4xl italic",
} as const satisfies Record<FontClassName, string>;

export const TypographySection = ({
  fonts,
  textLabel,
}: {
  fonts: readonly FontFamily[];
  textLabel: TextLabelToken;
}) => {
  const section = sectionById("typography");
  return (
    <DocumentSection
      aside={`${padCount(fonts.length)} families`}
      id={section.id}
      index={section.index}
      jp={section.jp}
      label={section.label}
    >
      <div className="flex flex-col gap-3">
        <SubHeading jp="書体族" label="Families" />
        <SpecGrid className="grid-cols-1 @2xl:grid-cols-2">
          {fonts.map((font, index) => (
            <SpecCell
              code={`F-${padCount(index + 1)}`}
              footer={font.cssVar}
              key={font.className}
              name={font.name}
            >
              <p
                className={cn(
                  "text-ink",
                  familySampleClassNames[font.className]
                )}
              >
                {font.sample}
              </p>
              <div className="flex flex-col gap-2">
                <ClassTag className="self-start">{font.className}</ClassTag>
                <p className="label text-mist normal-case">
                  {font.weights} · {font.role}
                </p>
              </div>
            </SpecCell>
          ))}
        </SpecGrid>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading jp="尺度" label="Scale" aside="px" />
        <ol className="border-rule border-t">
          {typeScaleSpecs.map((step) => (
            <li
              className="border-rule flex flex-col gap-2 border-b py-4"
              key={`${step.className}-${step.use}`}
            >
              <p className="label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-graphite break-all normal-case">
                  {step.className}
                </span>
                <span className="text-mist normal-case tabular-nums">
                  {step.size} · {step.use}
                </span>
              </p>
              <p className={cn("text-ink", step.className)}>{step.sample}</p>
            </li>
          ))}
        </ol>
        <p className="label text-mist flex flex-wrap items-baseline gap-x-3 gap-y-1 normal-case">
          <span>Theme step</span>
          <ClassTag>{textLabel.className}</ClassTag>
          <span className="tabular-nums">
            {textLabel.size} / {textLabel.lineHeight} /{" "}
            {textLabel.letterSpacing}
          </span>
        </p>
      </div>
    </DocumentSection>
  );
};

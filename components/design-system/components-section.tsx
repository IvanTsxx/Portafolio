import type { ReactNode } from "react";

import { Callout } from "@/components/content/callout";
import { SampleBadge } from "@/components/content/sample-badge";
import { Module } from "@/components/profile/module";
import { specimenVariants } from "@/components/profile/specimen-variants";
import { CornerMarks } from "@/components/site/corner-marks";
import { DocumentSection } from "@/components/site/document-section";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { PanelHeading } from "@/components/site/panel-heading";
import {
  chipClassName,
  technicalButtonVariants,
} from "@/components/site/styles";
import { siteComponentSpecs } from "@/lib/design-system/catalog";
import type {
  ComponentSpec,
  SiteComponentId,
} from "@/lib/design-system/catalog";
import { padCount } from "@/lib/design-system/format";
import { documentCode, sectionById } from "@/lib/design-system/sections";
import { cn } from "@/lib/utils";

import { Barcode } from "./barcode";
import { PreviewBox, SpecCell, SpecGrid } from "./spec-frame";

const technicalTones = ["outline", "selected", "solid"] as const;

const Wireframe = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    aria-hidden
    className={cn(
      "label border-rule-strong flex w-full flex-col gap-1 border p-1",
      className
    )}
  >
    {children}
  </div>
);

const Stamp = () => (
  <span className="border-graphite bg-graphite text-paper inline-flex min-h-11 flex-col items-center justify-center border-2 px-3 py-1 text-center">
    <span className="jp text-sm leading-tight">秘匿</span>
    <span className="label leading-tight">Redacted</span>
  </span>
);

const demos = {
  barcode: (
    <PreviewBox className="p-4">
      <Barcode value={documentCode} />
    </PreviewBox>
  ),
  callout: (
    <div className="flex flex-col gap-3">
      <Callout className="my-0" tone="note">
        <p>Plain note on a raised surface.</p>
      </Callout>
      <Callout className="my-0" tone="warning">
        <p>Hatch fill and corner marks.</p>
      </Callout>
    </div>
  ),
  chip: (
    <div className="flex flex-wrap gap-2">
      <button className={chipClassName} type="button">
        Motion
      </button>
      <button aria-pressed className={chipClassName} type="button">
        3D
      </button>
      <button className={chipClassName} type="button">
        Shaders
      </button>
    </div>
  ),
  "compact-dossier": (
    <Wireframe className="gap-2 p-2">
      <span className="hatch border-rule-strong h-10 w-full border" />
      <span className="bg-ink h-px w-2/3" />
      <span className="bg-rule-strong h-px w-full" />
      <span className="bg-rule-strong h-px w-full" />
    </Wireframe>
  ),
  "corner-marks": (
    <div className="grid w-full grid-cols-2 gap-3">
      <div className="relative flex h-20 items-center justify-center">
        <CornerMarks />
        <span className="label text-mist">Always</span>
      </div>
      <button
        className="group/marks focus-visible:ring-ink focus-visible:ring-offset-paper relative flex h-20 cursor-default items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        type="button"
      >
        <CornerMarks reveal="hover" />
        <span className="label text-mist">Hover or focus</span>
      </button>
    </div>
  ),
  "document-hero": (
    <Wireframe className="gap-2 p-2">
      <span className="border-rule-strong flex justify-between border-b pb-1">
        <span className="text-mist">Doc</span>
        <span className="text-ink tabular-nums">{documentCode}</span>
      </span>
      <span className="display text-ink text-4xl">Title</span>
      <span className="hazard-stripe text-ink block h-1.5 w-12" />
    </Wireframe>
  ),
  "document-layout": (
    <Wireframe>
      <span className="hatch border-rule-strong flex h-5 items-center justify-center border">
        Hero
      </span>
      <div className="grid grid-cols-12 gap-1">
        <span className="border-rule-strong text-mist col-span-4 flex h-14 items-center justify-center border border-dashed">
          Dossier
        </span>
        <span className="border-ink text-ink col-span-8 flex h-14 items-center justify-center border">
          Content
        </span>
      </div>
    </Wireframe>
  ),
  "document-section": (
    <div className="flex w-full flex-col gap-3">
      <PanelHeading
        as="p"
        aside="03 / 03"
        index="DS-07"
        jp="見本"
        label="Sample"
      />
      <span className="hatch border-rule-strong block h-8 border border-dashed" />
    </div>
  ),
  "leader-list": (
    <LeaderList className="w-full">
      <LeaderRow jp="役割" label="Role">
        Frontend engineer
      </LeaderRow>
      <LeaderRow jp="所在地" label="Location">
        Tucumán
      </LeaderRow>
      <LeaderRow jp="版" label="Rev">
        4.2
      </LeaderRow>
    </LeaderList>
  ),
  module: (
    <div className="border-rule w-full border-t border-l">
      <Module id="M-01" jp="見本" title="Specimen">
        <span className="hatch border-rule-strong block h-8 border border-dashed" />
      </Module>
    </div>
  ),
  "panel-heading": (
    <div className="w-full">
      <PanelHeading
        as="p"
        aside="07 rules"
        index="DS-01"
        jp="哲学"
        label="Philosophy"
      />
    </div>
  ),
  "redacted-block": (
    <div className="border-rule-strong hatch flex w-full flex-wrap items-center justify-between gap-4 border border-dashed p-4">
      <p className="label text-graphite max-w-48">
        Details are withheld <span className="jp">非開示</span>
      </p>
      <Stamp />
    </div>
  ),
  "sample-badge": <SampleBadge source="lib/site/practice.ts" />,
  "specimen-card": (
    <div className="border-rule grid w-full grid-cols-3 border-t border-l">
      {(["plain", "deep", "hatch"] as const).map((surface) => (
        <div
          className={cn(specimenVariants({ surface }), "p-3 md:p-3")}
          key={surface}
        >
          <span className="label text-mist">{surface}</span>
          <span className="bg-ink h-px w-6" />
        </div>
      ))}
    </div>
  ),
  "technical-button": (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {technicalTones.map((tone) => (
          <button
            className={technicalButtonVariants({ tone })}
            key={tone}
            type="button"
          >
            {tone}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {technicalTones.map((tone) => (
          <button
            className={technicalButtonVariants({ size: "sm", tone })}
            key={tone}
            type="button"
          >
            {tone}
          </button>
        ))}
      </div>
    </div>
  ),
} as const satisfies Record<SiteComponentId, ReactNode>;

const wideIds = new Set(["technical-button", "redacted-block", "callout"]);

const footerOf = (spec: ComponentSpec) =>
  spec.kind === "pattern"
    ? `Pattern · ${spec.file}`
    : `@/${spec.file.replace(/\.tsx?$/u, "")}`;

export const ComponentsSection = () => {
  const section = sectionById("components");
  return (
    <DocumentSection
      aside={`${padCount(siteComponentSpecs.length)} parts`}
      id={section.id}
      index={section.index}
      jp={section.jp}
      label={section.label}
    >
      <SpecGrid className="grid-cols-1 @3xl:grid-cols-2">
        {siteComponentSpecs.map((spec, index) => (
          <SpecCell
            className={wideIds.has(spec.id) ? "@3xl:col-span-2" : undefined}
            code={`S-${padCount(index + 1)}`}
            footer={footerOf(spec)}
            jp={spec.jp}
            key={spec.id}
            name={spec.name}
          >
            {demos[spec.id]}
            <p className="text-graphite text-sm leading-snug text-pretty">
              {spec.description}
            </p>
          </SpecCell>
        ))}
      </SpecGrid>
    </DocumentSection>
  );
};

import { DocumentSection } from "@/components/site/document-section";
import type { ContrastGrade } from "@/lib/design-system/color";
import { padCount } from "@/lib/design-system/format";
import type { ColorToken } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import { colorGroupLabels } from "@/lib/design-system/specs";
import type { ColorGroup } from "@/lib/design-system/specs";
import { sectionScripts } from "@/lib/site/section-scripts";

import { SpecCell, SpecGrid, SubHeading } from "./spec-frame";

const swatchGroups = [
  "surface",
  "ink",
  "rule",
  "agent",
  "signal",
] as const satisfies readonly ColorGroup[];

const gradeMarks = {
  AA: "AA",
  "AA-large": "AA·L",
  AAA: "AAA",
  "non-text": "Decor",
} as const satisfies Record<ContrastGrade, string>;

const ContrastMark = ({ token }: { token: ColorToken }) => {
  if (token.name === "paper") {
    return <span className="text-mist">Base</span>;
  }
  return (
    <span className="text-mist tabular-nums">
      {token.contrast.toFixed(1)}:1 {gradeMarks[token.grade]}
    </span>
  );
};

const Chip = ({
  className,
  token,
}: {
  className: string;
  token: ColorToken;
}) => (
  <span
    aria-hidden
    className={className}
    style={{ backgroundColor: `var(${token.cssVar})` }}
  />
);

const Swatch = ({ index, token }: { index: number; token: ColorToken }) => (
  <SpecCell
    code={`C-${padCount(index + 1)}`}
    footer={
      <span className="flex flex-col gap-0.5 break-normal">
        <span className="break-words">{token.tailwind}</span>
        <span className="tabular-nums">{token.hex}</span>
      </span>
    }
    name={token.name}
  >
    <Chip className="border-rule-strong block h-16 border" token={token} />
    <div className="flex flex-col gap-1">
      <p className="label">
        <ContrastMark token={token} />
      </p>
      <p className="text-graphite text-sm leading-snug text-pretty">
        {token.role}
      </p>
    </div>
  </SpecCell>
);

const AliasList = ({ tokens }: { tokens: readonly ColorToken[] }) => (
  <div className="@container">
    <ul className="border-rule grid grid-cols-2 border-t border-l @2xl:grid-cols-3 @4xl:grid-cols-4">
      {tokens.map((token) => (
        <li
          className="border-rule flex items-center gap-2 border-r border-b px-3 py-2"
          key={token.name}
        >
          <Chip
            className="border-rule-strong size-3 shrink-0 border"
            token={token}
          />
          <span className="label text-ink normal-case">{token.name}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ChartStrip = ({ tokens }: { tokens: readonly ColorToken[] }) => (
  <ul className="border-rule-strong grid grid-cols-5 border">
    {tokens.map((token) => (
      <li
        className="border-rule-strong flex flex-col gap-2 border-r p-2 last:border-r-0"
        key={token.name}
      >
        <Chip className="border-rule-strong block h-8 border" token={token} />
        <span className="label text-mist normal-case">{token.name}</span>
      </li>
    ))}
  </ul>
);

export const ColorSection = ({ colors }: { colors: readonly ColorToken[] }) => {
  const section = sectionById("color");
  const inGroup = (group: ColorGroup) =>
    colors.filter((token) => token.group === group);

  return (
    <DocumentSection
      aside={`${padCount(colors.length)} tokens`}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.designColor}
    >
      <p className="label text-mist flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span>Contrast vs paper</span>
        <span className="tabular-nums">
          AAA 7 · AA 4.5 · AA·L 3 · Decor below
        </span>
      </p>
      {swatchGroups.map((group) => {
        const tokens = inGroup(group);
        const { label } = colorGroupLabels[group];
        const offset = swatchGroups
          .slice(0, swatchGroups.indexOf(group))
          .reduce((total, previous) => total + inGroup(previous).length, 0);
        return (
          <div className="flex flex-col gap-3" key={group}>
            <SubHeading aside={padCount(tokens.length)} label={label} />
            <SpecGrid className="grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4">
              {tokens.map((token, index) => (
                <Swatch index={offset + index} key={token.name} token={token} />
              ))}
            </SpecGrid>
          </div>
        );
      })}
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={padCount(inGroup("semantic").length)}
          label={colorGroupLabels.semantic.label}
        />
        <AliasList tokens={inGroup("semantic")} />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={padCount(inGroup("chart").length)}
          label={colorGroupLabels.chart.label}
        />
        <ChartStrip tokens={inGroup("chart")} />
      </div>
    </DocumentSection>
  );
};

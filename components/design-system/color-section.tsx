import { DocumentSection } from "@/components/site/document-section";
import type { ContrastGrade } from "@/lib/design-system/color";
import { padCount } from "@/lib/design-system/format";
import type { ColorToken } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import { colorGroupLabels } from "@/lib/design-system/specs";
import type { ColorGroup } from "@/lib/design-system/specs";

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
      <p className="label text-graphite break-words normal-case">
        {token.cssVar}
      </p>
      <p className="label">
        <ContrastMark token={token} />
      </p>
      <p className="label text-mist break-words normal-case">{token.oklch}</p>
      <p className="text-graphite text-sm leading-snug text-pretty">
        {token.role}
      </p>
    </div>
  </SpecCell>
);

const SemanticTable = ({ tokens }: { tokens: readonly ColorToken[] }) => (
  <table className="label w-full border-collapse tabular-nums">
    <caption className="sr-only">Semantic color aliases</caption>
    <thead>
      <tr className="text-mist text-left">
        <th className="pb-2 font-normal" scope="col">
          Token
        </th>
        <th className="hidden pb-2 font-normal sm:table-cell" scope="col">
          Alias
        </th>
        <th className="hidden pb-2 font-normal md:table-cell" scope="col">
          OKLCH
        </th>
        <th className="pb-2 text-right font-normal" scope="col">
          Contrast
        </th>
      </tr>
    </thead>
    <tbody>
      {tokens.map((token) => (
        <tr className="border-rule border-t" key={token.name}>
          <td className="py-2">
            <span className="flex items-center gap-2">
              <Chip
                className="border-rule-strong size-3 shrink-0 border"
                token={token}
              />
              <span className="text-ink normal-case">{token.name}</span>
            </span>
          </td>
          <td className="text-mist hidden py-2 normal-case sm:table-cell">
            {token.alias ?? "Own value"}
          </td>
          <td className="text-mist hidden py-2 normal-case md:table-cell">
            {token.oklch}
          </td>
          <td className="py-2 text-right">
            <ContrastMark token={token} />
            {token.against === "paper" ? null : (
              <span className="text-mist"> on {token.against}</span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
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
      jp={section.jp}
      label={section.label}
    >
      <p className="label text-mist flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span>Source app/globals.css</span>
        <span>Contrast vs paper</span>
        <span className="tabular-nums">
          AAA 7 · AA 4.5 · AA·L 3 · Decor below
        </span>
      </p>
      {swatchGroups.map((group) => {
        const tokens = inGroup(group);
        const { jp, label } = colorGroupLabels[group];
        const offset = swatchGroups
          .slice(0, swatchGroups.indexOf(group))
          .reduce((total, previous) => total + inGroup(previous).length, 0);
        return (
          <div className="flex flex-col gap-3" key={group}>
            <SubHeading aside={padCount(tokens.length)} jp={jp} label={label} />
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
          jp={colorGroupLabels.semantic.jp}
          label={colorGroupLabels.semantic.label}
        />
        <SemanticTable tokens={inGroup("semantic")} />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={padCount(inGroup("chart").length)}
          jp={colorGroupLabels.chart.jp}
          label={colorGroupLabels.chart.label}
        />
        <ChartStrip tokens={inGroup("chart")} />
      </div>
    </DocumentSection>
  );
};

import { DocumentSection } from "@/components/site/document-section";
import { padCount } from "@/lib/design-system/format";
import { themeNames } from "@/lib/design-system/model";
import type { ColorToken, ThemeName } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import { colorGroupLabels } from "@/lib/design-system/specs";
import type { ColorGroup } from "@/lib/design-system/specs";

import { SpecList, SubHeading } from "./spec-list";

const swatchGroups = [
  "surface",
  "text",
  "line",
  "state",
  "code",
] as const satisfies readonly ColorGroup[];

const themeLabels = {
  dark: "Dark",
  light: "Light",
} as const satisfies Record<ThemeName, string>;

const contrastGroups = new Set<ColorGroup>(["text", "state"]);

const Swatch = ({ token, theme }: { token: ColorToken; theme: ThemeName }) => {
  const color = token.themes[theme];
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className="border-border-strong block size-8 shrink-0 border"
        style={{ backgroundColor: color.hex }}
      />
      <p className="label flex min-w-0 flex-col normal-case">
        <span className="text-faint">{themeLabels[theme]}</span>
        <span className="text-foreground tabular-nums">{color.hex}</span>
        {contrastGroups.has(token.group) ? (
          <span className="text-faint tabular-nums">
            {color.contrast.toFixed(1)}:1
          </span>
        ) : null}
      </p>
    </div>
  );
};

const ColorRow = ({ token }: { token: ColorToken }) => (
  <li className="border-border grid grid-cols-2 gap-x-6 gap-y-3 border-b py-3 md:grid-cols-[14rem_1fr_9rem_9rem] md:items-center">
    <p className="label col-span-2 flex flex-col normal-case md:col-span-1">
      <span className="text-foreground">{token.name}</span>
      <span className="text-faint break-words">
        {token.tailwind ?? token.cssVar}
      </span>
    </p>
    <p className="text-muted-foreground col-span-2 text-sm leading-snug text-pretty md:col-span-1">
      {token.role}
    </p>
    {themeNames.map((theme) => (
      <Swatch key={theme} theme={theme} token={token} />
    ))}
  </li>
);

const AliasList = ({ tokens }: { tokens: readonly ColorToken[] }) => (
  <p className="label text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 normal-case">
    {tokens.map((token) => (
      <span className="whitespace-nowrap" key={token.name}>
        <span className="text-foreground">{token.name}</span>
        {" to "}
        {token.themes.light.alias?.replace("--", "") ?? ""}
      </span>
    ))}
  </p>
);

export const ColorSection = ({ colors }: { colors: readonly ColorToken[] }) => {
  const section = sectionById("color");
  const inGroup = (group: ColorGroup) =>
    colors.filter((token) => token.group === group);
  const aliases = inGroup("alias");

  return (
    <DocumentSection
      aside={`${padCount(colors.length - aliases.length)} colors`}
      id={section.id}
      index={section.index}
      label={section.label}
    >
      {swatchGroups.map((group) => (
        <div className="flex flex-col gap-3" key={group}>
          <SubHeading label={colorGroupLabels[group]} />
          <SpecList>
            {inGroup(group).map((token) => (
              <ColorRow key={token.name} token={token} />
            ))}
          </SpecList>
        </div>
      ))}
      <div className="flex flex-col gap-3">
        <SubHeading label={colorGroupLabels.alias} />
        <AliasList tokens={aliases} />
      </div>
    </DocumentSection>
  );
};

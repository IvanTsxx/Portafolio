import { ImageResponse } from "next/og";

import { MonogramGlyph } from "@/components/site/monogram-glyph";

import type { MonogramWeight } from "./monogram";
import { printColors } from "./print-colors";

interface IconMark {
  cornerRadius: number;
  glyphScale: number;
  weight: MonogramWeight;
}

export const iconMarks = {
  app: { cornerRadius: 0, glyphScale: 0.6, weight: "mark" },
  tab: { cornerRadius: 0.18, glyphScale: 0.86, weight: "small" },
  touch: { cornerRadius: 0, glyphScale: 0.64, weight: "mark" },
} as const satisfies Record<string, IconMark>;

export type IconMarkId = keyof typeof iconMarks;

export const tabIconSizes = [16, 32, 48] as const;

export const appIconSizes = [192, 512] as const;

export const touchIconSize = 180;

export const renderIconMark = (id: IconMarkId, size: number) => {
  const mark: IconMark = iconMarks[id];
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        backgroundColor: printColors.charcoal,
        borderRadius: Math.round(size * mark.cornerRadius),
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <MonogramGlyph
        color={printColors.bone}
        ground={printColors.charcoal}
        size={Math.round(size * mark.glyphScale)}
        weight={mark.weight}
      />
    </div>,
    { height: size, width: size }
  );
};

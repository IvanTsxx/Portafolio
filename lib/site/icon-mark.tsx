import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";

import { siteConfig } from "./config";
import { printColors } from "./print-colors";

interface IconMark {
  cornerMarks: boolean;
  heavyInk: boolean;
  size: number;
  wordScale: number;
}

export const iconMarks = {
  tab: { cornerMarks: false, heavyInk: true, size: 32, wordScale: 0.84 },
  touch: { cornerMarks: true, heavyInk: false, size: 180, wordScale: 0.56 },
} as const satisfies Record<string, IconMark>;

export type IconMarkId = keyof typeof iconMarks;

const readWordmarkFont = () =>
  readFile(path.join(process.cwd(), "assets/fonts/InstrumentSerif-Italic.ttf"));

const cornerPlacements = (size: number) => {
  const stroke = Math.max(1, Math.round(size / 36));
  const inset = Math.round(size * 0.14);
  return [
    {
      id: "top-left",
      style: {
        borderLeftWidth: stroke,
        borderTopWidth: stroke,
        left: inset,
        top: inset,
      },
    },
    {
      id: "top-right",
      style: {
        borderRightWidth: stroke,
        borderTopWidth: stroke,
        right: inset,
        top: inset,
      },
    },
    {
      id: "bottom-left",
      style: {
        borderBottomWidth: stroke,
        borderLeftWidth: stroke,
        bottom: inset,
        left: inset,
      },
    },
    {
      id: "bottom-right",
      style: {
        borderBottomWidth: stroke,
        borderRightWidth: stroke,
        bottom: inset,
        right: inset,
      },
    },
  ] satisfies { id: string; style: CSSProperties }[];
};

const heavyInkShadow = (size: number) =>
  `${size / 48}px 0 0 ${printColors.ink}, -${size / 96}px 0 0 ${printColors.ink}`;

export const renderIconMark = async (id: IconMarkId) => {
  const mark: IconMark = iconMarks[id];
  const { size } = mark;
  const cornerLength = Math.round(size * 0.14);
  const wordStyle: CSSProperties = {
    fontSize: size * mark.wordScale,
    letterSpacing: -size * 0.02,
    lineHeight: 1,
    transform: `translate(${-size * 0.02}px, ${-size * 0.05}px)`,
  };
  if (mark.heavyInk) {
    wordStyle.textShadow = heavyInkShadow(size);
  }
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        backgroundColor: printColors.paper,
        color: printColors.ink,
        display: "flex",
        fontFamily: "Instrument Serif",
        fontStyle: "italic",
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
      }}
    >
      {mark.cornerMarks
        ? cornerPlacements(size).map(({ id: corner, style }) => (
            <div
              key={corner}
              style={{
                borderColor: printColors.ink,
                borderStyle: "solid",
                display: "flex",
                height: cornerLength,
                position: "absolute",
                width: cornerLength,
                ...style,
              }}
            />
          ))
        : null}
      <span style={wordStyle}>{siteConfig.nickname}</span>
    </div>,
    {
      fonts: [
        {
          data: await readWordmarkFont(),
          name: "Instrument Serif",
          style: "italic",
          weight: 400,
        },
      ],
      height: size,
      width: size,
    }
  );
};

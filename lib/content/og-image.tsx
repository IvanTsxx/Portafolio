import { readFileSync } from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";

import { siteConfig } from "@/lib/site/config";
import { inkAlpha, printColors } from "@/lib/site/print-colors";

export const size = { height: 630, width: 1200 } as const;

export const contentType = "image/png";

const palette = {
  ...printColors,
  grid: inkAlpha(0.07),
  ruleStrong: inkAlpha(0.7),
} as const;

const cornerSize = 20;
const cornerInset = 32;

const cornerPlacements = [
  {
    id: "top-left",
    style: {
      borderLeftWidth: 2,
      borderTopWidth: 2,
      left: cornerInset,
      top: cornerInset,
    },
  },
  {
    id: "top-right",
    style: {
      borderRightWidth: 2,
      borderTopWidth: 2,
      right: cornerInset,
      top: cornerInset,
    },
  },
  {
    id: "bottom-left",
    style: {
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      bottom: cornerInset,
      left: cornerInset,
    },
  },
  {
    id: "bottom-right",
    style: {
      borderBottomWidth: 2,
      borderRightWidth: 2,
      bottom: cornerInset,
      right: cornerInset,
    },
  },
] satisfies { id: string; style: CSSProperties }[];

const readGeistFont = (family: "geist-mono" | "geist-sans", file: string) =>
  readFileSync(
    path.join(process.cwd(), "node_modules/geist/dist/fonts", family, file)
  );

export interface OgImageContent {
  eyebrow: string;
  sample?: boolean;
  title: string;
}

const monoLine = {
  fontFamily: "Geist Mono",
  fontSize: 22,
  letterSpacing: 3.5,
  textTransform: "uppercase",
} as const;

export const renderOgImage = ({
  eyebrow,
  sample = false,
  title,
}: OgImageContent) => {
  const sansLight = readGeistFont("geist-sans", "Geist-Light.ttf");
  const monoRegular = readGeistFont("geist-mono", "GeistMono-Regular.ttf");

  return new ImageResponse(
    <div
      style={{
        backgroundColor: palette.paper,
        backgroundImage: `linear-gradient(to right, ${palette.grid} 1px, transparent 1px), linear-gradient(to bottom, ${palette.grid} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        color: palette.ink,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        height: "100%",
        justifyContent: "space-between",
        padding: 72,
        position: "relative",
        width: "100%",
      }}
    >
      {cornerPlacements.map((placement) => (
        <div
          key={placement.id}
          style={{
            borderColor: palette.ink,
            borderStyle: "solid",
            display: "flex",
            height: cornerSize,
            position: "absolute",
            width: cornerSize,
            ...placement.style,
          }}
        />
      ))}
      <div
        style={{
          ...monoLine,
          alignItems: "baseline",
          borderBottom: `2px solid ${palette.ruleStrong}`,
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: 12,
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ color: palette.mist }}>[ DOC ]</span>
          <span>{siteConfig.nickname}</span>
        </div>
        <span style={{ color: palette.mist }}>
          {sample ? "Sample content" : "Archive of builds"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <span style={{ ...monoLine, color: palette.graphite }}>{eyebrow}</span>
        <span
          style={{
            fontSize: title.length > 48 ? 72 : 104,
            fontWeight: 300,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          {title}
        </span>
        <div
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, ${palette.ink} 0px, ${palette.ink} 2px, transparent 2px, transparent 6px)`,
            display: "flex",
            height: 8,
            width: 96,
          }}
        />
      </div>
      <div
        style={{
          ...monoLine,
          borderTop: `1px solid ${palette.ruleStrong}`,
          color: palette.mist,
          display: "flex",
          fontSize: 20,
          justifyContent: "space-between",
          paddingTop: 12,
        }}
      >
        <span>{siteConfig.location}</span>
        <span style={{ textTransform: "none" }}>
          {new URL(siteConfig.url).host}
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { data: sansLight, name: "Geist", style: "normal", weight: 300 },
        { data: monoRegular, name: "Geist Mono", style: "normal", weight: 400 },
      ],
    }
  );
};

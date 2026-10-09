import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site/config";

const ogSize = { height: 630, width: 1200 } as const;

const palette = {
  background: "#0b0a09",
  clay: "#e57f4f",
  faint: "#5a5855",
  foreground: "#f2f0ec",
  muted: "#94928e",
  rule: "#1d1b1a",
  steel: "#83a3bb",
} as const;

const readGeistFont = (family: "geist-mono" | "geist-sans", file: string) =>
  readFile(
    path.join(process.cwd(), "node_modules/geist/dist/fonts", family, file)
  );

export interface OgImageContent {
  eyebrow: string;
  sample?: boolean;
  title: string;
}

export const renderOgImage = async ({
  eyebrow,
  sample = false,
  title,
}: OgImageContent) => {
  const [sansSemiBold, monoRegular] = await Promise.all([
    readGeistFont("geist-sans", "Geist-SemiBold.ttf"),
    readGeistFont("geist-mono", "GeistMono-Regular.ttf"),
  ]);

  return new ImageResponse(
    <div
      style={{
        backgroundColor: palette.background,
        backgroundImage: `linear-gradient(to right, ${palette.rule} 1px, transparent 1px), linear-gradient(to bottom, ${palette.rule} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        color: palette.foreground,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        height: "100%",
        justifyContent: "space-between",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: 24,
          justifyContent: "space-between",
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
          <div
            style={{
              backgroundColor: palette.clay,
              borderRadius: 4,
              height: 24,
              width: 24,
            }}
          />
          <span>{siteConfig.shortName}</span>
          <span style={{ color: palette.faint }}>/workshop</span>
        </div>
        {sample ? (
          <span style={{ color: palette.steel }}>Sample content</span>
        ) : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <span
          style={{
            color: palette.muted,
            fontFamily: "Geist Mono",
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            fontSize: title.length > 48 ? 64 : 88,
            fontWeight: 600,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          color: palette.faint,
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: 24,
          justifyContent: "space-between",
        }}
      >
        <span>{siteConfig.name}</span>
        <span>{new URL(siteConfig.url).host}</span>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { data: sansSemiBold, name: "Geist", style: "normal", weight: 600 },
        { data: monoRegular, name: "Geist Mono", style: "normal", weight: 400 },
      ],
    }
  );
};

import { readFileSync } from "node:fs";
import path from "node:path";

import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";
import sharp from "sharp";

import { MonogramGlyph } from "@/components/site/monogram-glyph";
import { siteConfig } from "@/lib/site/config";
import { nightColors } from "@/lib/site/print-colors";

export const size = { height: 630, width: 1200 } as const;

export const contentType = "image/png";

export interface OgTitle {
  accent?: string;
  signal?: boolean;
  text: string;
}

export interface OgLabel {
  code: string;
  meta?: string;
}

export type OgFigure = { kind: "portrait" } | { kind: "poster"; slug: string };

export interface OgImageContent {
  figure?: OgFigure;
  label: OgLabel;
  sample?: boolean;
  summary?: string;
  title: OgTitle;
}

const paddingX = 64;
const paddingY = 56;
const figureWidths = { portrait: 440, poster: 560 } as const;

const loadFonts = () => [
  {
    data: readFileSync(
      path.join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf")
    ),
    name: "Instrument Serif",
    style: "normal" as const,
    weight: 400 as const,
  },
  {
    data: readFileSync(
      path.join(process.cwd(), "assets/fonts/InstrumentSerif-Italic.ttf")
    ),
    name: "Instrument Serif",
    style: "italic" as const,
    weight: 400 as const,
  },
  {
    data: readFileSync(
      path.join(
        process.cwd(),
        "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"
      )
    ),
    name: "Geist Mono",
    style: "normal" as const,
    weight: 400 as const,
  },
  {
    data: readFileSync(
      path.join(
        process.cwd(),
        "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf"
      )
    ),
    name: "Geist",
    style: "normal" as const,
    weight: 400 as const,
  },
];

const pngDataUrl = (png: Buffer) =>
  `data:image/png;base64,${png.toString("base64")}`;

const posterPath = (slug: string) =>
  path.join(process.cwd(), "public/lab/posters", `${slug}-dark.webp`);

const loadPoster = async (slug: string, width: number, height: number) => {
  "use cache";
  cacheLife("max");
  return pngDataUrl(
    await sharp(posterPath(slug))
      .resize({ fit: "cover", height: height * 2, width: width * 2 })
      .png()
      .toBuffer()
  );
};

const bayerMatrix = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const rgbOf = (hex: string) => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

const loadDitheredPortrait = async (width: number, height: number) => {
  "use cache";
  cacheLife("max");
  const { data, info } = await sharp(
    path.join(process.cwd(), "public/profile/avatar.webp")
  )
    .resize(width, height, { fit: "cover" })
    .toColourspace("b-w")
    .linear(1.3, 18)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ink = rgbOf(nightColors.ink);
  const paper = rgbOf(nightColors.surface);
  const pixels = Buffer.alloc(width * height * 3);
  for (let position = 0; position < width * height; position += 1) {
    const x = position % width;
    const y = Math.floor(position / width);
    const threshold =
      (((bayerMatrix[(y % 4) * 4 + (x % 4)] ?? 0) + 0.5) / 16) * 255;
    const tone =
      (data[position * info.channels] ?? 0) > threshold ? ink : paper;
    pixels.set(tone, position * 3);
  }
  return pngDataUrl(
    await sharp(pixels, { raw: { channels: 3, height, width } })
      .resize(width * 2, height * 2, { kernel: "nearest" })
      .png()
      .toBuffer()
  );
};

const loadFigure = (figure: OgFigure, width: number) =>
  figure.kind === "portrait"
    ? loadDitheredPortrait(width, size.height)
    : loadPoster(figure.slug, width, size.height);

const mono = {
  fontFamily: "Geist Mono",
  fontSize: 18,
  letterSpacing: "0.16em",
  lineHeight: 1,
  textTransform: "uppercase",
} as const satisfies CSSProperties;

const hairline = `1px solid ${nightColors.border}`;

const titleSteps = [144, 120, 104, 88, 76, 64] as const;

const titleSizeOf = (length: number, measure: number) => {
  const fits = titleSteps.find((candidate) => {
    const charactersPerLine = measure / (candidate * 0.42);
    const lines = Math.ceil(length / charactersPerLine);
    if (candidate >= 104) {
      return lines <= 2;
    }
    return lines <= (candidate >= 76 ? 3 : 4);
  });
  return fits ?? 56;
};

interface TitleWord {
  accent: boolean;
  spaced: boolean;
  text: string;
}

const titleWordsOf = ({ accent, text }: OgTitle): TitleWord[] => {
  const start = accent ? text.indexOf(accent) : -1;
  const parts =
    !accent || start === -1
      ? [{ accent: false, text }]
      : [
          { accent: false, text: text.slice(0, start) },
          { accent: true, text: accent },
          { accent: false, text: text.slice(start + accent.length) },
        ].filter((part) => part.text !== "");
  return parts.flatMap((part) => {
    const tokens = part.text.trim().split(" ");
    return tokens.map((token, position) => ({
      accent: part.accent,
      spaced: position < tokens.length - 1 || part.text.endsWith(" "),
      text: token,
    }));
  });
};

const Title = ({ measure, title }: { measure: number; title: OgTitle }) => (
  <div
    style={{
      color: nightColors.ink,
      display: "flex",
      flexWrap: "wrap",
      fontFamily: "Instrument Serif",
      fontSize: titleSizeOf(title.text.length, measure),
      letterSpacing: "-0.03em",
      lineHeight: 0.98,
      width: measure,
    }}
  >
    {titleWordsOf(title).map((word, position) => (
      <span
        key={`${position}-${word.text}`}
        style={{
          color:
            word.accent && title.signal ? nightColors.signal : nightColors.ink,
          fontStyle: word.accent ? "italic" : "normal",
          marginRight: word.spaced ? "0.22em" : 0,
        }}
      >
        {word.text}
      </span>
    ))}
  </div>
);

const Summary = ({ measure, text }: { measure: number; text: string }) => (
  <div
    style={{
      color: nightColors.muted,
      display: "block",
      fontFamily: "Geist",
      fontSize: 26,
      lineClamp: 2,
      lineHeight: 1.4,
      width: measure,
    }}
  >
    {text}
  </div>
);

const SampleBadge = () => (
  <span
    style={{
      ...mono,
      border: `1px solid ${nightColors.borderStrong}`,
      color: nightColors.ink,
      fontSize: 14,
      padding: "6px 9px",
    }}
  >
    Sample
  </span>
);

const LabelRow = ({ label, sample }: { label: OgLabel; sample: boolean }) => (
  <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
    <span style={{ ...mono, color: nightColors.ink }}>{label.code}</span>
    <div
      style={{ borderTop: hairline, display: "flex", flexGrow: 1, height: 1 }}
    />
    {label.meta ? (
      <span style={{ ...mono, color: nightColors.faint }}>{label.meta}</span>
    ) : null}
    {sample ? <SampleBadge /> : null}
  </div>
);

const Masthead = () => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
      <MonogramGlyph
        color={nightColors.ink}
        ground={nightColors.paper}
        size={32}
        weight="small"
      />
      <span
        style={{ ...mono, color: nightColors.ink, letterSpacing: "0.32em" }}
      >
        {siteConfig.nickname}
      </span>
    </div>
    <span
      style={{
        ...mono,
        color: nightColors.faint,
        letterSpacing: "0.04em",
        textTransform: "none",
      }}
    >
      {new URL(siteConfig.url).host}
    </span>
  </div>
);

const FigurePanel = ({ src, width }: { src: string; width: number }) => (
  <div
    style={{
      borderRight: hairline,
      display: "flex",
      flexShrink: 0,
      height: size.height,
      width,
    }}
  >
    {/* oxlint-disable-next-line next/no-img-element, react-doctor/nextjs-no-img-element -- satori draws plain img elements into the PNG */}
    <img
      alt=""
      height={size.height}
      src={src}
      style={{ height: size.height, objectFit: "cover", width }}
      width={width}
    />
  </div>
);

export const renderOgImage = async (content: OgImageContent) => {
  const figureWidth = content.figure ? figureWidths[content.figure.kind] : 0;
  const figureSrc = content.figure
    ? await loadFigure(content.figure, figureWidth)
    : null;
  const measure = size.width - figureWidth - paddingX * 2;
  return new ImageResponse(
    <div
      style={{
        backgroundColor: nightColors.paper,
        color: nightColors.ink,
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      {figureSrc ? <FigurePanel src={figureSrc} width={figureWidth} /> : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
          padding: `${paddingY}px ${paddingX}px`,
        }}
      >
        <Masthead />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <LabelRow label={content.label} sample={content.sample === true} />
          <Title measure={measure} title={content.title} />
          {content.summary ? (
            <Summary measure={measure} text={content.summary} />
          ) : null}
        </div>
      </div>
    </div>,
    { ...size, fonts: loadFonts() }
  );
};

export const padCount = (value: number) => String(value).padStart(2, "0");

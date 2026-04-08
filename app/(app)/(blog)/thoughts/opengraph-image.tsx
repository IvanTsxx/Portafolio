import { readFile } from "node:fs/promises";

import { ImageResponse } from "next/og";

import { SITE } from "@/shared/config/site";
import { USER } from "@/shared/config/user";
import { getAllThoughts } from "@/shared/lib/thoughts";

// ── OG Image dimensions ───────────────────────────────────────────────────────

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

// ── Brand colors ───────────────────────────────────────────────────────────────

const BRAND_GREEN = "#00d26a";
const BG_DARK = "#0a0a0a";
const TEXT_MUTED = "#737373";
const TEXT_LIGHT = "#fafafa";

const ogImagePath = `${process.cwd()}/public/avatar.jpeg`;
const ogImageBuffer = await readFile(ogImagePath);
const avatarSrc = `data:image/jpeg;base64,${ogImageBuffer.toString("base64")}`;

// ── Main OG Image Component ───────────────────────────────────────────────────

export default async function Image() {
  const thoughts = getAllThoughts();
  const totalCount = thoughts.length;
  const authorName = USER.displayName;

  return new ImageResponse(
    <div
      style={{
        background: BG_DARK,
        color: TEXT_LIGHT,
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans",
        height: "100%",
        overflow: "hidden",
        padding: 48,
        position: "relative",
        width: "100%",
      }}
    >
      {/* Top bar: branding */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 40,
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
          <div
            style={{
              alignItems: "center",
              background: BRAND_GREEN,
              borderRadius: 4,
              color: BG_DARK,
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              height: 32,
              justifyContent: "center",
              width: 32,
            }}
          >
            I
          </div>
          <span
            style={{
              color: TEXT_LIGHT,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            THOUGHTS
          </span>
        </div>

        <span style={{ color: TEXT_MUTED, fontSize: 28 }}>
          {totalCount} articles
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          Writing about Next.js, architecture, and building things on the web.
        </div>

        {/* Recent posts preview */}
        <div
          style={{
            color: TEXT_MUTED,
            display: "flex",
            flexDirection: "column",
            fontSize: 28,
            gap: 8,
            marginTop: 8,
          }}
        >
          {thoughts.slice(0, 3).map((t) => (
            <div
              key={t.slug}
              style={{
                alignItems: "center",
                display: "flex",
                gap: 12,
              }}
            >
              <span style={{ color: BRAND_GREEN, fontWeight: 700 }}>▸</span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {t.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar: author */}
      <div
        style={{
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          marginTop: 24,
          paddingTop: 20,
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
          {avatarSrc ? (
            <img
              alt={`${authorName} avatar`}
              height={70}
              src={avatarSrc}
              style={{
                border: "2px solid #00d26a",
                borderRadius: "50%",
              }}
              width={70}
            />
          ) : (
            <div
              style={{
                alignItems: "center",
                background: BRAND_GREEN,
                borderRadius: "50%",
                color: BG_DARK,
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                height: 40,
                justifyContent: "center",
                width: 40,
              }}
            >
              {authorName.charAt(0)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 28, fontWeight: 600 }}>{authorName}</span>
            <span style={{ color: TEXT_MUTED, fontSize: 28 }}>
              {USER.jobTitle}
            </span>
          </div>
        </div>

        <span style={{ color: TEXT_MUTED, fontSize: 28 }}>
          {SITE.url.replace("https://", "")}
        </span>
      </div>
    </div>,
    {
      height: 630,
      width: 1200,
    }
  );
}

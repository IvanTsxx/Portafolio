import { readFile } from "node:fs/promises";

import { ImageResponse } from "next/og";

import { SITE } from "@/shared/config/site";
import { USER } from "@/shared/config/user";

export const dynamic = "force-dynamic";

// ── OG Image dimensions ───────────────────────────────────────────────────────

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

// ── Brand colors ───────────────────────────────────────────────────────────────

const BRAND_GREEN = "#00d26a";
const BG_DARK = "#0a0a0a";
const TEXT_MUTED = "#737373";
const TEXT_LIGHT = "#fafafa";

// ── Avatar ─────────────────────────────────────────────────────────────────────

const ogImagePath = `${process.cwd()}/public/avatar.jpeg`;
const ogImageBuffer = await readFile(ogImagePath);
const avatarSrc = `data:image/jpeg;base64,${ogImageBuffer.toString("base64")}`;

// ── Main OG Image Component ───────────────────────────────────────────────────

export default async function Image() {
  const authorName = USER.displayName;

  // Fallback programmatic OG image
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
      {/* Background grid pattern */}
      <div
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          inset: 0,
          position: "absolute",
        }}
      />

      {/* Top bar */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 40,
          position: "relative",
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
            IVANTSX
          </span>
        </div>

        <span style={{ color: TEXT_MUTED, fontSize: 28 }}>PORTFOLIO</span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 20,
          position: "relative",
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
          {USER.displayName}
        </div>

        {/* Job title */}
        <div
          style={{
            color: BRAND_GREEN,
            fontSize: 28,
            fontWeight: 500,
          }}
        >
          {USER.jobTitle}
        </div>

        {/* Bio */}
        <div
          style={{
            color: TEXT_MUTED,
            fontSize: 28,
            lineHeight: 1.5,
            maxWidth: 700,
          }}
        >
          {USER.bio}
        </div>

        {/* Location */}
        <div
          style={{
            alignItems: "center",
            color: TEXT_MUTED,
            display: "flex",
            fontSize: 28,
            gap: 8,
            marginTop: 8,
          }}
        >
          <span style={{ color: BRAND_GREEN }}>📍</span>
          <span>{USER.location}</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          marginTop: 24,
          paddingTop: 20,
          position: "relative",
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
              {USER.handle}
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

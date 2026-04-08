import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

import { SITE } from "@/shared/config/site";
import { USER } from "@/shared/config/user";
import { getComponent } from "@/shared/lib/registry";

// ── OG Image dimensions ───────────────────────────────────────────────────────

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

// ── Brand colors ───────────────────────────────────────────────────────────────

const BRAND_GREEN = "#00d26a";
const BG_DARK = "#0a0a0a";
const TEXT_MUTED = "#737373";
const TEXT_LIGHT = "#fafafa";
const BORDER = "rgba(255,255,255,0.06)";

// ── Avatar ─────────────────────────────────────────────────────────────────────

const avatarBuffer = fs.existsSync(
  path.join(process.cwd(), "public", "avatar.webp")
)
  ? fs.readFileSync(path.join(process.cwd(), "public", "avatar.webp"))
  : null;

// ── Main OG Image Component ───────────────────────────────────────────────────

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getComponent(slug);

  if (!entry) {
    return new ImageResponse(
      <div
        style={{
          alignItems: "center",
          background: BG_DARK,
          color: TEXT_LIGHT,
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700 }}>Component not found</div>
        <div style={{ color: TEXT_MUTED, fontSize: 18, marginTop: 8 }}>404</div>
      </div>,
      { height: 630, width: 1200 }
    );
  }

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
      {/* Top bar: registry name */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 32,
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
              fontSize: 14,
              fontWeight: 700,
              height: 32,
              justifyContent: "center",
              width: 32,
            }}
          >
            <span style={{ fontSize: 28 }}>◇</span>
          </div>
          <span
            style={{
              color: TEXT_LIGHT,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            COMPONENTS
          </span>
        </div>

        {/* Type badge */}
        <div
          style={{
            alignItems: "center",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 4,
            color: TEXT_MUTED,
            display: "flex",
            fontSize: 28,
            fontWeight: 500,
            padding: "4px 12px",
          }}
        >
          {entry.type.replace("registry:", "").toUpperCase()}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Component name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: -0.5,
            lineHeight: 1.2,
          }}
        >
          {entry.title}
        </div>

        {/* Description */}
        <div
          style={{
            color: TEXT_MUTED,
            fontSize: 28,
            lineHeight: 1.5,
            maxWidth: 800,
          }}
        >
          {entry.description}
        </div>

        {/* Dependencies */}
        {entry.dependencies.length > 0 ? (
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {entry.dependencies.slice(0, 3).map((dep) => (
              <div
                key={dep}
                style={{
                  alignItems: "center",
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 4,
                  color: TEXT_LIGHT,
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 500,
                  padding: "6px 14px",
                }}
              >
                {dep}
              </div>
            ))}
            {entry.dependencies.length > 3 ? (
              <div
                style={{
                  alignItems: "center",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 4,
                  color: TEXT_MUTED,
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 500,
                  padding: "6px 14px",
                }}
              >
                +{entry.dependencies.length - 3}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Bottom bar: author */}
      <div
        style={{
          alignItems: "center",
          borderTop: BORDER,
          display: "flex",
          justifyContent: "space-between",
          marginTop: 24,
          paddingTop: 20,
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
          {avatarBuffer ? (
            <img
              alt={`${authorName} avatar`}
              height={40}
              src={`data:image/png;base64,${avatarBuffer.toString("base64")}`}
              style={{
                border: "2px solid #00d26a",
                borderRadius: "50%",
              }}
              width={40}
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

        {/* Site */}
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

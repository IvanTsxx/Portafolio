import { readFile } from "node:fs/promises";

import { ImageResponse } from "next/og";

import { SITE } from "@/shared/config/site";
import { USER } from "@/shared/config/user";
import { getThoughtBySlug } from "@/shared/lib/thoughts";

export const dynamic = "force-dynamic";

// ── OG Image dimensions (1200x630 = 1.91:1 standard) ─────────────────────────

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

// ── Brand colors ───────────────────────────────────────────────────────────────

const BRAND_GREEN = "#00d26a";
const BG_DARK = "#0a0a0a";
const TEXT_MUTED = "#737373";
const TEXT_LIGHT = "#fafafa";
const BORDER = "rgba(255,255,255,0.06)";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Main OG Image Component ───────────────────────────────────────────────────

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const thought = await getThoughtBySlug(slug);

  if (!thought) {
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
        <div style={{ fontSize: 28, fontWeight: 700 }}>Thought not found</div>
        <div style={{ color: TEXT_MUTED, fontSize: 28, marginTop: 8 }}>404</div>
      </div>,
      { height: 630, width: 1200 }
    );
  }

  const ogImagePath = `${process.cwd()}/public/avatar.jpeg`;
  const ogImageBuffer = await readFile(ogImagePath);
  const avatarSrc = `data:image/jpeg;base64,${ogImageBuffer.toString("base64")}`;

  const displayTags = thought.tags.slice(0, 3);
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
      {/* Top bar: blog name + date */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        {/* Blog branding */}
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

        {/* Date */}
        <span style={{ color: TEXT_MUTED, fontSize: 28 }}>
          {formatDate(thought.date)}
        </span>
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
        {/* Title */}
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: -0.5,
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {thought.title}
        </div>

        {/* Description */}
        {thought.description ? (
          <div
            style={{
              color: TEXT_MUTED,
              fontSize: 28,
              lineHeight: 1.5,
              maxWidth: 800,
            }}
          >
            {thought.description}
          </div>
        ) : null}

        {/* Tags */}
        {displayTags.length > 0 ? (
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {displayTags.map((tag) => (
              <div
                key={tag}
                style={{
                  alignItems: "center",
                  background: "rgba(0, 210, 106, 0.08)",
                  border: "1px solid rgba(0, 210, 106, 0.3)",
                  borderRadius: 4,
                  color: BRAND_GREEN,
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 500,
                  padding: "6px 14px",
                }}
              >
                {tag}
              </div>
            ))}
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
          {/* Avatar */}
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

// app/(app)/thoughts/[slug]/opengraph-image.tsx
// app/(app)/thoughts/[slug]/twitter-image.tsx  ← identical, copy as-is

import { ImageResponse } from "@takumi-rs/image-response";

import { createOgImage, OG_COLORS, OgLayout, OG_SIZE } from "@/shared/lib/og";
import { getThoughtBySlug } from "@/shared/lib/thoughts";

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const thought = await getThoughtBySlug(slug);
  const { brandGreen, bgDark, textLight, textMuted } = OG_COLORS;

  if (!thought) {
    // 404 fallback - Takumi has Geist built-in
    return new ImageResponse(
      <div
        style={{
          alignItems: "center",
          background: bgDark,
          color: textLight,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Geist",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700 }}>Thought not found</div>
        <div style={{ color: textMuted, fontSize: 28, marginTop: 8 }}>404</div>
      </div>,
      {
        ...OG_SIZE,
      }
    );
  }

  const displayTags = thought.tags.slice(0, 3);

  return createOgImage(({ avatarSrc }) => (
    <OgLayout
      avatarSrc={avatarSrc}
      topBar={{
        label: "THOUGHTS",
        right: formatDate(thought.date),
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
            color: textMuted,
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
                color: brandGreen,
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
    </OgLayout>
  ));
}

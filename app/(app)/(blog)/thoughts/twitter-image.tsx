// app/(app)/thoughts/opengraph-image.tsx
// app/(app)/thoughts/twitter-image.tsx  ← identical, copy as-is

import { createOgImage, OG_COLORS, OgLayout } from "@/shared/lib/og";
import { getAllThoughts } from "@/shared/lib/thoughts";

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image() {
  const thoughts = await getAllThoughts();
  const { brandGreen, textMuted } = OG_COLORS;

  return createOgImage(({ avatarSrc }) => (
    <OgLayout
      avatarSrc={avatarSrc}
      topBar={{
        label: "THOUGHTS",
        right: `${thoughts.length} articles`,
      }}
    >
      {/* Headline */}
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

      {/* Recent posts */}
      <div
        style={{
          color: textMuted,
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
            style={{ alignItems: "center", display: "flex", gap: 12 }}
          >
            <span style={{ color: brandGreen, fontWeight: 700 }}>*</span>
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
    </OgLayout>
  ));
}

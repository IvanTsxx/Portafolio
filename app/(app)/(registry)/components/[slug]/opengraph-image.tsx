// ─────────────────────────────────────────────────────────────────────────────
// app/(app)/components/[slug]/opengraph-image.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { ImageResponse } from "@takumi-rs/image-response";

import { createOgImage, OG_COLORS, OgLayout, OG_SIZE } from "@/shared/lib/og";
import { getComponent } from "@/shared/lib/registry";

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getComponent(slug);
  const { bgDark, textLight, textMuted, border } = OG_COLORS;

  if (!entry) {
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
        <div style={{ fontSize: 48, fontWeight: 700 }}>Component not found</div>
        <div style={{ color: textMuted, fontSize: 18, marginTop: 8 }}>404</div>
      </div>,
      {
        ...OG_SIZE,
      }
    );
  }

  return createOgImage(({ avatarSrc }) => (
    <OgLayout
      avatarSrc={avatarSrc}
      topBar={{
        label: "COMPONENTS",
        labelIcon: true,
        right: (
          <div
            style={{
              alignItems: "center",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 4,
              color: textMuted,
              display: "flex",
              fontSize: 28,
              fontWeight: 500,
              padding: "4px 12px",
            }}
          >
            {entry.type.replace("registry:", "").toUpperCase()}
          </div>
        ),
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
          color: textMuted,
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
                border: `1px solid ${border}`,
                borderRadius: 4,
                color: textLight,
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
                color: textMuted,
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
    </OgLayout>
  ));
}

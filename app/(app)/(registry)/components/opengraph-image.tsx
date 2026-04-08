import { createOgImage, OG_COLORS, OgLayout } from "@/shared/lib/og";
import { getComponents } from "@/shared/lib/registry";

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function ComponentsImage() {
  const components = await getComponents();
  const { brandGreen, textMuted } = OG_COLORS;

  return createOgImage(({ avatarSrc }) => (
    <OgLayout
      avatarSrc={avatarSrc}
      topBar={{
        label: "COMPONENTS",
        labelIcon: true,
        right: `${components.length} components`,
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
        Reusable components built for the modern web.
      </div>

      <div style={{ color: textMuted, fontSize: 28, lineHeight: 1.5 }}>
        Install via shadcn CLI.
      </div>

      {/* Component list preview */}
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
        {components.slice(0, 5).map((c) => (
          <div
            key={c.name}
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
              {c.title}
            </span>
          </div>
        ))}
      </div>
    </OgLayout>
  ));
}

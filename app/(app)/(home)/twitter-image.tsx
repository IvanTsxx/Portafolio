// app/(app)/(home)/opengraph-image.tsx
// app/(app)/(home)/twitter-image.tsx  ← identical, copy as-is

import { USER } from "@/shared/config/user";
import { createOgImage, OG_COLORS, OgLayout } from "@/shared/lib/og";

export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default function Image() {
  const { textLight, brandGreen } = OG_COLORS;

  return createOgImage(({ avatarSrc }) => (
    <OgLayout
      avatarSrc={avatarSrc}
      topBar={{ label: "IVANTSX", right: "PORTFOLIO" }}
    >
      {/* Name */}
      <div style={{ fontSize: 44 }}>{USER.displayName}</div>

      {/* Job title */}
      <div style={{ color: brandGreen, fontSize: 28 }}>{USER.jobTitle}</div>

      {/* Bio */}
      <div style={{ fontSize: 28, maxWidth: 700 }}>{USER.bio}</div>

      {/* Location */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 28,
          gap: 8,
          marginTop: 8,
        }}
      >
        <span style={{ color: brandGreen }}>*</span>
        <span style={{ color: textLight }}>{USER.location}</span>
      </div>
    </OgLayout>
  ));
}

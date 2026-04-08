import { SITE } from "@/shared/config/site";
import { USER } from "@/shared/config/user";

// ── Brand tokens ──────────────────────────────────────────────────────────────

export const OG_COLORS = {
  bgDark: "#0a0a0a",
  border: "rgba(255,255,255,0.06)",
  brandGreen: "#00d26a",
  textLight: "#fafafa",
  textMuted: "#737373",
} as const;

export const OG_SIZE = { height: 630, width: 1200 };

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OgTopBarProps {
  /** Left side label (e.g. "THOUGHTS", "COMPONENTS", "PORTFOLIO") */
  label: string;
  /** Optional decorative green asterisk before the label */
  labelIcon?: boolean;
  /** Right side content — string or pre-built node */
  right?: string | React.ReactNode;
}

export interface OgLayoutProps {
  topBar: OgTopBarProps;
  /** Main body content — rendered between top bar and bottom bar */
  children: React.ReactNode;
  /** base64 data URI for the avatar — pass null to render initials fallback */
  avatarSrc: string | null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ src, name }: { src: string | null; name: string }) {
  const { brandGreen, bgDark } = OG_COLORS;

  if (src) {
    return (
      <img
        alt={`${name} avatar`}
        height={70}
        src={src}
        style={{ border: `2px solid ${brandGreen}`, borderRadius: "50%" }}
        width={70}
      />
    );
  }

  return (
    <div
      style={{
        alignItems: "center",
        background: brandGreen,
        borderRadius: "50%",
        color: bgDark,
        display: "flex",
        fontSize: 28,
        fontWeight: 700,
        height: 40,
        justifyContent: "center",
        width: 40,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────

export function OgLayout({ topBar, children, avatarSrc }: OgLayoutProps) {
  const { brandGreen, bgDark, textLight, textMuted, border } = OG_COLORS;
  const authorName = USER.displayName;

  return (
    <div
      style={{
        background: bgDark,
        color: textLight,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        height: "100%",
        overflow: "hidden",
        padding: 48,
        position: "relative",
        width: "100%",
      }}
    >
      {/* Background grid */}
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
          {topBar.labelIcon && (
            <div
              style={{
                alignItems: "center",
                background: brandGreen,
                borderRadius: 4,
                color: bgDark,
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                height: 32,
                justifyContent: "center",
                width: 32,
              }}
            >
              *
            </div>
          )}
          <span
            style={{
              color: textLight,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            {topBar.label}
          </span>
        </div>

        {topBar.right !== undefined && (
          <span style={{ color: textMuted, fontSize: 28 }}>{topBar.right}</span>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 20,
          position: "relative",
        }}
      >
        {children}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          alignItems: "center",
          borderTop: `1px solid ${border}`,
          display: "flex",
          justifyContent: "space-between",
          marginTop: 24,
          paddingTop: 20,
          position: "relative",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
          <Avatar name={authorName} src={avatarSrc} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 28, fontWeight: 600 }}>{authorName}</span>
            <span style={{ color: textMuted, fontSize: 28 }}>
              {USER.jobTitle}
            </span>
          </div>
        </div>

        <span style={{ color: textMuted, fontSize: 28 }}>
          {SITE.url.replace("https://", "")}
        </span>
      </div>
    </div>
  );
}

export const glyphRamps = {
  blocks: " ░▒▓█",
  classic: " .:-=+*#%@",
} as const;

export type GlyphSet = keyof typeof glyphRamps | "custom";

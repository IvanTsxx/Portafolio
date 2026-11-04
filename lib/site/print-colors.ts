export const printColors = {
  bone: "#edece8",
  border: "#2a2a2d",
  borderStrong: "#4a4a4f",
  charcoal: "#0b0b0c",
  faint: "#737376",
  muted: "#a6a5a3",
  signal: "#9aabb9",
} as const;

export const paperColors = {
  border: "#d2d0cc",
  borderStrong: "#9a9894",
  faint: "#7d7e81",
  ink: "#151516",
  muted: "#56575a",
  paper: "#f7f6f2",
  signal: "#506678",
  surface: "#eeede9",
} as const;

export const nightColors = {
  border: printColors.border,
  borderStrong: printColors.borderStrong,
  faint: printColors.faint,
  ink: printColors.bone,
  muted: printColors.muted,
  paper: printColors.charcoal,
  signal: printColors.signal,
  surface: "#18181a",
} as const satisfies Record<keyof typeof paperColors, string>;

export const lightBackground = paperColors.paper;

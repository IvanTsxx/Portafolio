export const printColors = {
  clay: "#db703b",
  graphite: "#3d3d3b",
  ink: "#121212",
  mist: "#646361",
  paper: "#ebebe9",
} as const;

export const inkAlpha = (alpha: number) => `rgba(18, 18, 18, ${alpha})`;

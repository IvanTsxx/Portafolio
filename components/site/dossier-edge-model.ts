export const dossierEdges = [
  "binding",
  "stitch",
  "dither",
  "ruler",
  "none",
] as const;

export type DossierEdgeVariant = (typeof dossierEdges)[number];

export type DossierEdgeSize = "detail" | "document";

export const defaultDossierEdge: DossierEdgeVariant = "binding";

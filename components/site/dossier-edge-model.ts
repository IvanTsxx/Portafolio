export const dossierEdges = ["bound", "binding", "dither"] as const;

export type DossierEdgeVariant = (typeof dossierEdges)[number];

export const defaultDossierEdge: DossierEdgeVariant = "bound";

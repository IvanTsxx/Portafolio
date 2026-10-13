"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { DossierEdge } from "@/components/site/dossier-edge";
import {
  defaultDossierEdge,
  dossierEdges,
} from "@/components/site/dossier-edge-model";
import type {
  DossierEdgeSize,
  DossierEdgeVariant,
} from "@/components/site/dossier-edge-model";

const parseEdge = (value: string | null): DossierEdgeVariant =>
  dossierEdges.find((edge) => edge === value) ?? defaultDossierEdge;

const EdgeFromSearch = ({ size }: { size: DossierEdgeSize }) => (
  <DossierEdge size={size} variant={parseEdge(useSearchParams().get("edge"))} />
);

export const DossierEdgeReview = ({ size }: { size: DossierEdgeSize }) => (
  <Suspense fallback={<DossierEdge size={size} variant={defaultDossierEdge} />}>
    <EdgeFromSearch size={size} />
  </Suspense>
);

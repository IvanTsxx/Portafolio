"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { DossierEdge } from "@/components/site/dossier-edge";
import {
  defaultDossierEdge,
  dossierEdges,
} from "@/components/site/dossier-edge-model";

const EdgeFromSearch = () => {
  const requested = useSearchParams().get("edge");
  return (
    <DossierEdge
      variant={
        dossierEdges.find((edge) => edge === requested) ?? defaultDossierEdge
      }
    />
  );
};

export const DossierEdgeReview = () => (
  <Suspense fallback={<DossierEdge variant={defaultDossierEdge} />}>
    <EdgeFromSearch />
  </Suspense>
);

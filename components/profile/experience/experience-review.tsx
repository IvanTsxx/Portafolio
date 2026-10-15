"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";

import { conceptOf } from "./concept";
import type { ExperienceConcept } from "./concept";

type ConceptViews = Record<ExperienceConcept, ReactNode>;

const ConceptFromSearch = ({ views }: { views: ConceptViews }) =>
  views[conceptOf(useSearchParams().get("exp"))];

export const ExperienceReview = ({ views }: { views: ConceptViews }) => (
  <Suspense fallback={views.a}>
    <ConceptFromSearch views={views} />
  </Suspense>
);

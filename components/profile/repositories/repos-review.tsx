"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";

const reviewKeys = ["d", "e", "f", "h", "i", "j"] as const;

type ReviewKey = (typeof reviewKeys)[number];

type ReviewConcepts = Record<ReviewKey, ReactNode>;

const isReviewKey = (value: string | null): value is ReviewKey =>
  reviewKeys.some((key) => key === value);

const ConceptFromSearch = ({ concepts }: { concepts: ReviewConcepts }) => {
  const asked = useSearchParams().get("repos");
  return concepts[isReviewKey(asked) ? asked : "d"];
};

export const ReposReview = (concepts: ReviewConcepts) => (
  <Suspense fallback={concepts.d}>
    <ConceptFromSearch concepts={concepts} />
  </Suspense>
);

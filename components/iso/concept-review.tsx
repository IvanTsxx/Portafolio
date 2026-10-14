"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";

const ConceptFromSearch = ({ a, b }: { a: ReactNode; b: ReactNode }) =>
  useSearchParams().get("concept") === "b" ? b : a;

export const ConceptReview = ({ a, b }: { a: ReactNode; b: ReactNode }) => (
  <Suspense fallback={a}>
    <ConceptFromSearch a={a} b={b} />
  </Suspense>
);

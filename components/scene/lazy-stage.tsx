"use client";

import dynamic from "next/dynamic";
import { createContext, use } from "react";

import type { StageProps } from "./stage";
import { StageFallback } from "./stage-fallback";

const FallbackLabelContext = createContext("Loading workshop scene");

const LoadingFallback = () => (
  <StageFallback label={use(FallbackLabelContext)} />
);

const loadStage = async () => {
  const { Stage } = await import("./stage");
  return Stage;
};

const DeferredStage = dynamic(loadStage, {
  loading: LoadingFallback,
  ssr: false,
});

export const LazyStage = (props: StageProps) => (
  <FallbackLabelContext value={props.label}>
    <DeferredStage {...props} />
  </FallbackLabelContext>
);

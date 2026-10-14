"use client";

import dynamic from "next/dynamic";

import { PreviewLoading } from "@/components/lab/preview-loading";

export const PlotterHatchingLive = dynamic(() => import("./preview"), {
  loading: PreviewLoading,
  ssr: false,
});

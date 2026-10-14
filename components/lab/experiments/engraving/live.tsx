"use client";

import dynamic from "next/dynamic";

import { PreviewLoading } from "@/components/lab/preview-loading";

export const EngravingLive = dynamic(() => import("./preview"), {
  loading: PreviewLoading,
  ssr: false,
});

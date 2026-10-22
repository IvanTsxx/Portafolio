"use client";

import dynamic from "next/dynamic";

import { PreviewLoading } from "@/components/lab/preview-loading";

export const SpeedSmearLive = dynamic(() => import("./preview"), {
  loading: PreviewLoading,
  ssr: false,
});

"use client";

import dynamic from "next/dynamic";

import { PreviewLoading } from "@/components/lab/preview-loading";

export const OrbitDustLive = dynamic(() => import("./preview"), {
  loading: PreviewLoading,
  ssr: false,
});

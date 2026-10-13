"use client";

import dynamic from "next/dynamic";

import { PreviewLoading } from "@/components/lab/preview-loading";

export const CrtLive = dynamic(() => import("./preview"), {
  loading: PreviewLoading,
  ssr: false,
});

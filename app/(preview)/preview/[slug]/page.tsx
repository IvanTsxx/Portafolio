"use client";

import * as React from "react";
import { Suspense, useEffect } from "react";

import { Index } from "@/__registry__/index";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string }>;
}

export default function PreviewPage({ params, searchParams }: Props) {
  return (
    <Suspense>
      <PreviewContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function PreviewContent({ params, searchParams }: Props) {
  const { slug } = React.use(params);
  const { type } = React.use(searchParams) as {
    type?: "component" | "block" | "page";
  };

  const entry = Index[slug];

  // ✅ Auto-resize → manda altura real al parent
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;

      window.parent.postMessage({ height, type: "PREVIEW_HEIGHT" }, "*");
    };

    sendHeight();

    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  if (!entry) {
    return (
      <div className="flex items-center justify-center text-[12px] text-muted-foreground">
        No preview for &quot;{slug}&quot;
      </div>
    );
  }

  const Component = entry.component;

  return (
    <div
      className={cn(
        "w-full bg-background p-4",
        type === "component" &&
          "flex justify-center items-center max-w-fit min-h-screen mx-auto"
      )}
    >
      <Suspense fallback={<Spinner />}>
        <Component />
      </Suspense>
    </div>
  );
}

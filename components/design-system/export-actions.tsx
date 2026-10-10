"use client";

import {
  CheckIcon,
  CopyIcon,
  DownloadSimpleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { technicalButtonVariants } from "@/components/site/styles";
import { cn } from "@/lib/utils";

type CopyStatus = "copied" | "failed" | "idle";

const statusDuration = 2000;

const copyLabels = {
  copied: "Copied",
  failed: "Copy failed",
  idle: "Copy design.md",
} as const satisfies Record<CopyStatus, string>;

const CopyIndicator = ({ status }: { status: CopyStatus }) => {
  if (status === "copied") {
    return <CheckIcon aria-hidden className="size-4" />;
  }
  if (status === "failed") {
    return <WarningIcon aria-hidden className="size-4" />;
  }
  return <CopyIcon aria-hidden className="size-4" />;
};

export const ExportActions = ({
  filename,
  href,
  markdown,
}: {
  filename: string;
  href: string;
  markdown: string;
}) => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(
      () => setStatus("idle"),
      statusDuration
    );
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className={cn(
          technicalButtonVariants({ tone: "solid" }),
          "min-w-44",
          status === "failed" && "border-destructive"
        )}
        data-status={status}
        onClick={copy}
        type="button"
      >
        <CopyIndicator status={status} />
        {copyLabels[status]}
      </button>
      <a
        className={technicalButtonVariants({ tone: "outline" })}
        download={filename}
        href={href}
      >
        <DownloadSimpleIcon aria-hidden className="size-4" />
        Download
      </a>
      <output aria-live="polite" className="sr-only">
        {status === "idle" ? "" : copyLabels[status]}
      </output>
    </div>
  );
};

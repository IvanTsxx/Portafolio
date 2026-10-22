"use client";

import { CheckIcon, CopyIcon, WarningIcon } from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";

import { technicalButtonVariants } from "@/components/site/styles";
import { cn } from "@/lib/utils";

type CopyStatus = "copied" | "failed" | "idle";

const statusDuration = 2000;

const CopyIndicator = ({ status }: { status: CopyStatus }) => {
  if (status === "copied") {
    return <CheckIcon aria-hidden className="size-4" />;
  }
  if (status === "failed") {
    return <WarningIcon aria-hidden className="size-4" />;
  }
  return <CopyIcon aria-hidden className="size-4" />;
};

export const CopyButton = ({
  className,
  label,
  text,
  tone = "solid",
}: {
  className?: string;
  label: string;
  text: string;
} & Pick<VariantProps<typeof technicalButtonVariants>, "tone">) => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
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

  const statusLabels = {
    copied: "Copied",
    failed: "Copy failed",
    idle: label,
  } as const satisfies Record<CopyStatus, string>;

  return (
    <>
      <button
        className={cn(
          technicalButtonVariants({ tone }),
          "min-w-44",
          status === "failed" && "border-destructive",
          className
        )}
        data-status={status}
        onClick={copy}
        type="button"
      >
        <CopyIndicator status={status} />
        {statusLabels[status]}
      </button>
      <output aria-live="polite" className="sr-only">
        {status === "idle" ? "" : statusLabels[status]}
      </output>
    </>
  );
};

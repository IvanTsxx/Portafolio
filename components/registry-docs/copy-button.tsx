"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const confirmationDuration = 2000;

export const CopyButton = ({
  className,
  label = "Copy to clipboard",
  value,
}: {
  className?: string;
  label?: string;
  value: string;
}) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(
      () => setCopied(false),
      confirmationDuration
    );
  };

  return (
    <button
      aria-label={label}
      className={cn(
        "text-graphite hover:text-ink focus-visible:text-ink focus-visible:ring-ink ease-mechanical inline-flex size-11 shrink-0 items-center justify-center transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-inset",
        copied && "text-ink hover:text-ink",
        className
      )}
      onClick={copy}
      type="button"
    >
      {copied ? (
        <CheckIcon aria-hidden="true" className="size-4" />
      ) : (
        <CopyIcon aria-hidden="true" className="size-4" />
      )}
      <output aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </output>
    </button>
  );
};

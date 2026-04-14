"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/shared/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "inline-flex items-center justify-center size-6 text-muted-foreground",
        "hover:text-brand-green transition-colors shrink-0",
        className
      )}
    >
      {copied ? (
        <Check className="size-3 text-brand-green" />
      ) : (
        <Copy className="size-3" />
      )}
    </button>
  );
}

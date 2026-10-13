"use client";

import { useEffect, useState } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

const confirmationMs = 1800;

export const CopyEmail = ({ email }: { email: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }
    const timer = window.setTimeout(() => setIsCopied(false), confirmationMs);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <>
      <button
        className={cn(
          "group/ink text-ink flex min-h-11 cursor-pointer items-baseline gap-3 text-left text-lg font-light tracking-tight",
          focusRingClassName
        )}
        onClick={copy}
        type="button"
      >
        <span className="ink-underline break-all">{email}</span>
        <span
          aria-hidden
          className="label text-mist ease-mechanical data-[copied=true]:text-ink shrink-0 opacity-0 transition-opacity duration-150 group-focus-visible/ink:opacity-100 data-[copied=true]:opacity-100 pointer-fine:group-hover/ink:opacity-100"
          data-copied={isCopied}
        >
          {isCopied ? "Copied" : "Copy"}
        </span>
      </button>
      <span aria-live="polite" className="sr-only">
        {isCopied ? "Email copied" : ""}
      </span>
    </>
  );
};

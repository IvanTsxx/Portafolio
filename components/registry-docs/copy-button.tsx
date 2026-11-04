"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const confirmationDuration = 1800;

const copyButtonVariants = cva(
  "group/copy text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-focus data-[copied]:text-signal hover:bg-foreground/5 relative inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md px-2.5 transition-[color,background-color,opacity,translate] duration-200 focus-visible:outline-1 active:translate-y-px",
  {
    defaultVariants: { reveal: "always" },
    variants: {
      reveal: {
        always: "",
        hover:
          "data-[copied]:opacity-100 pointer-fine:opacity-0 pointer-fine:group-focus-within/code:opacity-100 pointer-fine:group-hover/code:opacity-100",
      },
    },
  }
);

export const CopyButton = ({
  className,
  getValue,
  label = "Copy to clipboard",
  reveal,
  showLabel = false,
  value,
}: {
  className?: string;
  getValue?: () => string;
  label?: string;
  showLabel?: boolean;
  value?: string;
} & VariantProps<typeof copyButtonVariants>) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getValue?.() ?? value ?? "");
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
      className={cn(copyButtonVariants({ reveal }), className)}
      data-copied={copied ? "" : undefined}
      onClick={copy}
      type="button"
    >
      <span aria-hidden className="relative grid size-4 place-items-center">
        <CopyIcon
          className={cn(
            "ease-out-expo absolute size-4 transition-[opacity,scale,rotate] duration-300",
            copied ? "scale-50 -rotate-45 opacity-0" : "scale-100 opacity-100"
          )}
        />
        <CheckIcon
          className={cn(
            "ease-out-expo absolute size-4 transition-[opacity,scale] duration-300",
            copied ? "pop-in scale-100 opacity-100" : "scale-50 opacity-0"
          )}
          weight="bold"
        />
      </span>
      {showLabel ? (
        <span className="label relative h-4 overflow-hidden">
          <span
            className={cn(
              "ease-out-expo flex flex-col transition-transform duration-300",
              copied && "-translate-y-4"
            )}
          >
            <span className="h-4">Copy</span>
            <span className="h-4">Copied</span>
          </span>
        </span>
      ) : null}
      <output aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </output>
    </button>
  );
};

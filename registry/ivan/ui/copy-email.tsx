"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { cn } from "@/lib/utils";

const copyEmailVariants = cva(
  "group/copy text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-11 cursor-pointer items-baseline gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    defaultVariants: { size: "md" },
    variants: {
      size: {
        lg: "text-2xl font-light tracking-tight",
        md: "text-lg font-light tracking-tight",
        sm: "text-sm",
      },
    },
  }
);

const underlineClassName =
  "after:bg-current ease-mechanical relative break-all after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-150 group-focus-visible/copy:after:scale-x-100 pointer-fine:group-hover/copy:after:scale-x-100 motion-reduce:after:transition-none";

const hintClassName =
  "text-muted-foreground ease-mechanical data-[copied=true]:text-foreground shrink-0 font-mono text-xs tracking-widest uppercase opacity-0 transition-opacity duration-150 group-focus-visible/copy:opacity-100 data-[copied=true]:opacity-100 pointer-coarse:opacity-100 pointer-fine:group-hover/copy:opacity-100 motion-reduce:transition-none";

export interface CopyEmailProps
  extends
    Omit<ComponentProps<"button">, "children" | "type">,
    VariantProps<typeof copyEmailVariants> {
  email: string;
  label?: string;
  hint?: string;
  copiedHint?: string;
  resetAfter?: number;
}

export const CopyEmail = ({
  email,
  label,
  hint = "Copy",
  copiedHint = "Copied",
  resetAfter = 1800,
  size,
  className,
  onClick,
  ...props
}: CopyEmailProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }
    const timer = window.setTimeout(() => setIsCopied(false), resetAfter);
    return () => window.clearTimeout(timer);
  }, [isCopied, resetAfter]);

  const copy = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
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
        className={cn(copyEmailVariants({ size }), className)}
        onClick={copy}
        type="button"
        {...props}
      >
        <span className={underlineClassName}>{label ?? email}</span>
        <span aria-hidden className={hintClassName} data-copied={isCopied}>
          {isCopied ? copiedHint : hint}
        </span>
      </button>
      <span aria-live="polite" className="sr-only">
        {isCopied ? `${email} copied` : ""}
      </span>
    </>
  );
};

export interface CopyEmailFaceProps
  extends
    Omit<ComponentProps<"span">, "children">,
    VariantProps<typeof copyEmailVariants> {
  email: string;
  label?: string;
}

export const CopyEmailFace = ({
  email,
  label,
  size,
  className,
  ...props
}: CopyEmailFaceProps) => (
  <span className={cn(copyEmailVariants({ size }), className)} {...props}>
    <span className={underlineClassName}>{label ?? email}</span>
  </span>
);

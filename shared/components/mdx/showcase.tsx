"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface ShowcaseProps {
  children: ReactNode;
  subtitle?: string;
  className?: string;
  preview?: ReactNode;
}

export function Showcase({ subtitle, className, preview }: ShowcaseProps) {
  return (
    <div
      className={cn(
        "mt-6 mb-8 flex flex-col overflow-hidden rounded-xl border border-border bg-background",
        className
      )}
    >
      {/* Visual Preview Section (if any) */}
      {preview && (
        <div className="flex w-full items-center justify-center border-b border-border bg-secondary/30 p-8 min-h-[250px]">
          {preview}
        </div>
      )}

      {/* Subtitle Bar */}
      {subtitle && (
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2">
          <span className="text-[12px] text-muted-foreground font-medium">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}

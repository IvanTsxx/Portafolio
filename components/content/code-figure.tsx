"use client";

import type { ComponentProps } from "react";
import { useRef } from "react";

import { CopyButton } from "@/components/registry-docs/copy-button";
import { cn } from "@/lib/utils";

export const CodeFigure = ({
  children,
  className,
  ...props
}: ComponentProps<"figure">) => {
  const figure = useRef<HTMLElement>(null);
  const readCode = () =>
    figure.current?.querySelector("pre")?.textContent ?? "";
  return (
    <figure
      className={cn(
        "group/code border-border bg-code relative my-10 overflow-hidden rounded-lg border",
        className
      )}
      ref={figure}
      {...props}
    >
      <div className="absolute top-2 right-2 z-10">
        <CopyButton
          className="bg-code/90 backdrop-blur-sm"
          getValue={readCode}
          label="Copy code"
          reveal="hover"
        />
      </div>
      {children}
    </figure>
  );
};

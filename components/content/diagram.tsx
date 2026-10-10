import type { ReactNode } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { cn } from "@/lib/utils";

export interface DiagramProps {
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
  label: string;
}

export const Diagram = ({
  caption,
  children,
  className,
  label,
}: DiagramProps) => (
  <figure aria-label={label} className={cn("my-10", className)}>
    <div className="blueprint-dots border-rule-strong bg-popover relative flex justify-center overflow-x-auto border p-6 [--grid-size:16px] md:p-8">
      <CornerMarks />
      {children}
    </div>
    {caption ? (
      <figcaption className="label text-graphite mt-3 normal-case">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

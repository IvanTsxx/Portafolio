import type { ReactNode } from "react";

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
    <div className="blueprint-dots border-rule bg-card flex justify-center overflow-x-auto rounded-sm border p-6 md:p-8">
      {children}
    </div>
    {caption ? (
      <figcaption className="text-muted-foreground mt-3 text-sm text-pretty">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

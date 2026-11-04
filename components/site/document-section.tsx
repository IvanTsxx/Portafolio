import type { ReactNode } from "react";

import { PanelHeading } from "@/components/site/panel-heading";
import { cn } from "@/lib/utils";

interface DocumentSectionProps {
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  id: string;
  index: string;
  label: string;
}

export const DocumentSection = ({
  aside,
  children,
  className,
  id,
  index,
  label,
}: DocumentSectionProps) => (
  <section
    aria-labelledby={`${id}-heading`}
    className={cn(
      "relative flex min-w-0 scroll-mt-24 flex-col gap-10",
      className
    )}
    data-index={index}
    id={id}
  >
    <PanelHeading
      aside={aside}
      id={`${id}-heading`}
      index={index}
      label={label}
    />
    {children}
  </section>
);

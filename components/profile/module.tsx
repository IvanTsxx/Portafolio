import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ModuleProps {
  id: string;
  title: string;
  jp: string;
  className?: string;
  children: ReactNode;
}

export const TickMark = () => (
  <>
    <span aria-hidden className="bg-ink absolute top-0 left-0 h-2 w-px" />
    <span aria-hidden className="bg-ink absolute top-0 left-0 h-px w-2" />
  </>
);

export const Module = ({ id, title, jp, className, children }: ModuleProps) => (
  <section
    aria-label={title}
    className={cn(
      "border-rule relative border-r border-b p-4 md:p-5",
      className
    )}
  >
    <TickMark />
    <header className="label mb-5 flex items-baseline justify-between">
      <span className="flex items-baseline gap-2">
        <span className="text-mist">{id}</span>
        <span className="text-ink">{title}</span>
      </span>
      <span className="jp text-mist">{jp}</span>
    </header>
    {children}
  </section>
);

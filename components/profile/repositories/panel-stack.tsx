import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface RackItem {
  id: string;
  node: ReactNode;
}

export const PanelStack = ({
  active,
  className,
  panels,
}: {
  active: number;
  className?: string;
  panels: readonly RackItem[];
}) => (
  <div aria-hidden className={cn("grid", className)}>
    {panels.map(({ id, node }, index) => (
      <div
        className={cn(
          "ease-out-quart col-start-1 row-start-1 flex transition-[opacity,translate] duration-200",
          index === active
            ? "opacity-100"
            : "pointer-events-none opacity-0 motion-safe:translate-y-1"
        )}
        key={id}
      >
        {node}
      </div>
    ))}
  </div>
);

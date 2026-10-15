import type { ReactNode } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const FilterFold = ({ children }: { children: ReactNode }) => (
  <details className="group/fold border-rule-strong -mt-16 border-b">
    <summary
      className={cn(
        "label text-graphite hover:text-ink ease-mechanical flex min-h-11 cursor-pointer list-none items-center gap-3 transition-colors duration-100 [&::-webkit-details-marker]:hidden",
        focusRingClassName
      )}
    >
      <span className="text-ink">Filter</span>
      <span
        aria-hidden
        className="border-rule-strong mb-1 h-px min-w-4 flex-1 self-end border-b border-dotted"
      />
      <span
        aria-hidden
        className="ease-out-quart grid size-4 place-items-center transition-transform duration-300 group-open/fold:rotate-45"
      >
        +
      </span>
    </summary>
    <div className="pt-2 pb-8">{children}</div>
  </details>
);

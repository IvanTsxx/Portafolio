import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const PreviewStage = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn(
      "border-rule-strong bg-popover blueprint-dots relative flex min-h-64 items-center justify-center overflow-hidden border p-6 [--clay:var(--clay-deep)] [--grid-size:16px] md:p-10",
      className
    )}
    data-slot="preview-stage"
    {...props}
  />
);

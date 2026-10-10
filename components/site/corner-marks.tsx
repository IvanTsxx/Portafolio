import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cornerPlacements = [
  "top-1.5 left-1.5 border-t border-l",
  "top-1.5 right-1.5 border-t border-r",
  "bottom-1.5 left-1.5 border-b border-l",
  "right-1.5 bottom-1.5 border-r border-b",
] as const;

const cornerVariants = cva(
  "border-ink pointer-events-none absolute size-2 select-none",
  {
    defaultVariants: { reveal: "always" },
    variants: {
      reveal: {
        always: "",
        hover:
          "ease-mechanical opacity-0 transition-opacity duration-100 group-focus-within/marks:opacity-100 group-hover/marks:opacity-100",
      },
    },
  }
);

export const CornerMarks = ({
  className,
  reveal,
}: { className?: string } & VariantProps<typeof cornerVariants>) => (
  <>
    {cornerPlacements.map((placement) => (
      <span
        aria-hidden
        className={cn(cornerVariants({ reveal }), placement, className)}
        key={placement}
      />
    ))}
  </>
);

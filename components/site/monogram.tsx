import { useId } from "react";

import {
  monogramGlyphPath,
  monogramIncision,
  monogramIncisionWidth,
  monogramViewBox,
} from "@/lib/site/monogram";
import type { MonogramWeight } from "@/lib/site/monogram";
import { cn } from "@/lib/utils";

export const Monogram = ({
  className,
  weight = "mark",
}: {
  className?: string;
  weight?: MonogramWeight;
}) => {
  const maskId = useId();
  return (
    <svg
      aria-hidden
      className={cn("shrink-0", className)}
      fill="currentColor"
      viewBox={monogramViewBox}
    >
      <mask id={maskId}>
        <rect fill="white" height="64" width="64" />
        <line
          stroke="black"
          strokeWidth={monogramIncisionWidth[weight]}
          {...monogramIncision}
        />
      </mask>
      <path d={monogramGlyphPath} mask={`url(#${maskId})`} />
    </svg>
  );
};

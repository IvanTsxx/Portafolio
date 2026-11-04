import {
  monogramGlyphPath,
  monogramIncision,
  monogramIncisionWidth,
  monogramTightViewBox,
} from "@/lib/site/monogram";
import type { MonogramWeight } from "@/lib/site/monogram";

export const MonogramGlyph = ({
  color,
  ground,
  size,
  weight,
}: {
  color: string;
  ground: string;
  size: number;
  weight: MonogramWeight;
}) => (
  <svg
    height={size}
    viewBox={monogramTightViewBox}
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={monogramGlyphPath} fill={color} />
    <line
      {...monogramIncision}
      stroke={ground}
      strokeWidth={monogramIncisionWidth[weight]}
    />
  </svg>
);

import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import {
  EDGE_DITHER_CELL,
  EDGE_DITHER_COLUMNS,
  EDGE_DITHER_ROWS,
  edgeDitherPath,
} from "./dossier-edge-grid";
import type { DossierEdgeSize, DossierEdgeVariant } from "./dossier-edge-model";

const bindingHoleCount = {
  detail: 50,
  document: 34,
} as const satisfies Record<DossierEdgeSize, number>;

const ditherBandVariants = cva(
  "pointer-events-none fixed inset-y-0 hidden h-full opacity-10",
  {
    variants: {
      side: {
        left: "left-0",
        right: "right-0 -scale-x-100",
      },
      size: {
        detail: "w-24 2xl:block",
        document: "w-24 xl:block 2xl:w-40",
      },
    },
  }
);

const ditherPatternId = "dossier-edge-dither";

const DitherEdge = ({ size }: { size: DossierEdgeSize }) => {
  const fill = `url(#${ditherPatternId})`;
  return (
    <>
      <svg aria-hidden className={ditherBandVariants({ side: "left", size })}>
        <defs>
          <pattern
            height={EDGE_DITHER_ROWS * EDGE_DITHER_CELL}
            id={ditherPatternId}
            patternUnits="userSpaceOnUse"
            width={EDGE_DITHER_COLUMNS * EDGE_DITHER_CELL}
          >
            <path
              className="fill-ink [shape-rendering:crispEdges]"
              d={edgeDitherPath()}
              transform={`scale(${EDGE_DITHER_CELL})`}
            />
          </pattern>
        </defs>
        <rect fill={fill} height="100%" width="100%" />
      </svg>
      <svg aria-hidden className={ditherBandVariants({ side: "right", size })}>
        <rect fill={fill} height="100%" width="100%" />
      </svg>
    </>
  );
};

const BindingEdge = ({ size }: { size: DossierEdgeSize }) => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-x-12 top-3 z-20 hidden justify-between lg:flex"
  >
    {Array.from({ length: bindingHoleCount[size] }, (_, hole) => (
      <span
        className="border-rule-strong/60 bg-paper-deep size-2 rounded-full border"
        key={hole}
      />
    ))}
  </span>
);

const edgeRenderers = {
  binding: BindingEdge,
  dither: DitherEdge,
  none: () => null,
} as const satisfies Record<
  DossierEdgeVariant,
  (props: { size: DossierEdgeSize }) => ReactNode
>;

export const DossierEdge = ({
  size,
  variant,
}: {
  size: DossierEdgeSize;
  variant: DossierEdgeVariant;
}) => {
  const Edge = edgeRenderers[variant];
  return <Edge size={size} />;
};

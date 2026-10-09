import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

const technicalGridVariants = cva(
  "text-muted-foreground relative isolate overflow-hidden",
  {
    defaultVariants: { tone: "muted" },
    variants: {
      tone: {
        clay: "[--tg-ink:var(--clay)] [--tg-major:26%] [--tg-minor:10%]",
        muted: "[--tg-ink:var(--foreground)] [--tg-major:12%] [--tg-minor:6%]",
        strong:
          "[--tg-ink:var(--foreground)] [--tg-major:22%] [--tg-minor:10%]",
      },
    },
  }
);

const technicalGridFieldVariants = cva(
  "pointer-events-none absolute inset-0 select-none",
  {
    defaultVariants: { fade: "none" },
    variants: {
      fade: {
        bottom: "[mask-image:linear-gradient(to_bottom,black_30%,transparent)]",
        edges:
          "[mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]",
        none: "",
        top: "[mask-image:linear-gradient(to_top,black_30%,transparent)]",
      },
    },
  }
);

type GridScan = "none" | "horizontal" | "vertical" | "both";

type GridStyle = CSSProperties & {
  "--tg-cell": string;
  "--tg-scan-duration": string;
};

type NodeRingStyle = CSSProperties & { "--tg-node-duration": string };

interface TechnicalGridProps
  extends
    ComponentProps<"div">,
    VariantProps<typeof technicalGridVariants>,
    VariantProps<typeof technicalGridFieldVariants> {
  animated?: boolean;
  caption?: string;
  cellSize?: number;
  label?: string;
  majorEvery?: number;
  markers?: boolean;
  nodes?: number;
  scan?: GridScan;
  scanDuration?: number;
}

const maxNodes = 24;
const goldenRatio = 0.618;
const plasticRatio = 0.755;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const fraction = (value: number) => value - Math.floor(value);

const inkMix = (strength: string) =>
  `color-mix(in oklab, var(--tg-ink) ${strength}, transparent)`;

const buildLines = (strength: string) => [
  `linear-gradient(to right, ${inkMix(strength)} 1px, transparent 1px)`,
  `linear-gradient(to bottom, ${inkMix(strength)} 1px, transparent 1px)`,
];

const buildGridLayers = (cellSize: number, majorEvery: number) => {
  const minorLayers = buildLines("var(--tg-minor)");
  const minorSize = `${cellSize}px ${cellSize}px`;

  if (majorEvery < 2) {
    return {
      backgroundImage: minorLayers.join(", "),
      backgroundSize: `${minorSize}, ${minorSize}`,
    };
  }

  const majorLayers = buildLines("var(--tg-major)");
  const majorSize = `${cellSize * majorEvery}px ${cellSize * majorEvery}px`;

  return {
    backgroundImage: [...majorLayers, ...minorLayers].join(", "),
    backgroundSize: [majorSize, majorSize, minorSize, minorSize].join(", "),
  };
};

const buildScanBand = (direction: "to bottom" | "to right") =>
  [
    `linear-gradient(${direction}`,
    "transparent 85%",
    `${inkMix("14%")} calc(100% - 1px)`,
    `${inkMix("60%")} calc(100% - 1px)`,
    `${inkMix("60%")} 100%)`,
  ].join(", ");

const buildNodes = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const left = `${(8 + fraction(index * goldenRatio + 0.17) * 84).toFixed(2)}%`;
    const top = `${(8 + fraction(index * plasticRatio + 0.31) * 84).toFixed(2)}%`;
    const ringStyle: NodeRingStyle = {
      "--tg-node-duration": `${(3 + ((index * 0.61) % 2)).toFixed(2)}s`,
      animationDelay: `${((index * 1.37) % 4).toFixed(2)}s`,
    };
    const positionStyle: CSSProperties = {
      left: `round(nearest, ${left}, var(--tg-cell))`,
      top: `round(nearest, ${top}, var(--tg-cell))`,
    };
    return { id: `${left}-${top}`, positionStyle, ringStyle };
  });

const markerPositions = [
  "top-2 left-2 border-t border-l",
  "top-2 right-2 border-t border-r",
  "bottom-2 left-2 border-b border-l",
  "bottom-2 right-2 border-r border-b",
] as const;

const TechnicalGrid = ({
  animated = true,
  caption,
  cellSize = 32,
  children,
  className,
  fade,
  label,
  majorEvery = 4,
  markers = true,
  nodes = 5,
  scan = "horizontal",
  scanDuration = 8,
  style,
  tone,
  ...props
}: TechnicalGridProps) => {
  const safeCellSize = clamp(Math.round(cellSize), 8, 160);
  const safeMajorEvery = clamp(Math.round(majorEvery), 0, 12);
  const nodeCount = clamp(Math.round(nodes), 0, maxNodes);
  const showHorizontalScan =
    animated && (scan === "horizontal" || scan === "both");
  const showVerticalScan = animated && (scan === "vertical" || scan === "both");
  const rootStyle: GridStyle = {
    "--tg-cell": `${safeCellSize}px`,
    "--tg-scan-duration": `${clamp(scanDuration, 1, 60)}s`,
    ...style,
  };

  return (
    <div
      className={cn(technicalGridVariants({ tone }), className)}
      data-slot="technical-grid"
      style={rootStyle}
      {...props}
    >
      <div
        aria-hidden="true"
        className={technicalGridFieldVariants({ fade })}
        data-slot="technical-grid-field"
      >
        <div
          className="absolute inset-0"
          style={buildGridLayers(safeCellSize, safeMajorEvery)}
        />
        {showHorizontalScan ? (
          <div
            className="absolute inset-x-0 top-0 h-full animate-[technical-grid-scan-y_var(--tg-scan-duration)_linear_infinite] motion-reduce:hidden"
            style={{ backgroundImage: buildScanBand("to bottom") }}
          />
        ) : null}
        {showVerticalScan ? (
          <div
            className="absolute inset-y-0 left-0 w-full animate-[technical-grid-scan-x_var(--tg-scan-duration)_linear_infinite] motion-reduce:hidden"
            style={{
              animationDelay: "calc(var(--tg-scan-duration) / -2)",
              backgroundImage: buildScanBand("to right"),
            }}
          />
        ) : null}
        {buildNodes(nodeCount).map((node) => (
          <span
            className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2"
            key={node.id}
            style={node.positionStyle}
          >
            <span className="absolute inset-0 bg-(--tg-ink)" />
            <span
              className="absolute inset-0 animate-[technical-grid-ping_var(--tg-node-duration)_ease-out_infinite] border border-(--tg-ink) motion-reduce:hidden"
              style={node.ringStyle}
            />
          </span>
        ))}
      </div>
      {markers
        ? markerPositions.map((position) => (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute size-3 border-current text-(--tg-ink) opacity-50",
                position
              )}
              data-slot="technical-grid-marker"
              key={position}
            />
          ))
        : null}
      {label ? (
        <span className="pointer-events-none absolute top-2 left-7 font-mono text-xs leading-3 tracking-widest uppercase">
          {label}
        </span>
      ) : null}
      {caption ? (
        <span className="pointer-events-none absolute right-7 bottom-2 font-mono text-xs leading-3 tracking-widest uppercase">
          {caption}
        </span>
      ) : null}
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
};

export { TechnicalGrid };
export type { GridScan, TechnicalGridProps };

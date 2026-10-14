import type { CSSProperties, ReactNode } from "react";

import type { Flat, LineTone, SolidPaths, Tone } from "./iso-kit";

export interface IsoLink {
  href: string;
  label: string;
}

export const IsoItem = ({
  children,
  className,
  index,
  link,
  style,
}: {
  children: ReactNode;
  className?: string;
  index: number;
  link: IsoLink | undefined;
  style?: CSSProperties;
}) => (
  <a
    aria-label={link?.label}
    className={className ? `iso-item ${className}` : "iso-item"}
    data-item={index}
    href={link?.href}
    style={style}
  >
    {children}
  </a>
);

const tenth = (value: number) => Math.round(value * 10) / 10;

export const Solid = ({
  children,
  crease = "faint",
  inner,
  paths,
  tone = "hi",
}: {
  children?: ReactNode;
  crease?: Tone | "none";
  inner?: ReactNode;
  paths: SolidPaths;
  tone?: Tone;
}) => (
  <g className="iso-solid">
    <path className="iso-fill" d={paths.fill} />
    {paths.shades.map((d, shade) =>
      d ? (
        <path className="iso-shade" d={d} data-shade={shade} key={shade} />
      ) : null
    )}
    <path className="iso-top" d={paths.top} />
    {crease !== "none" && paths.crease ? (
      <path
        className="iso-line iso-crease"
        d={paths.crease}
        data-tone={crease}
      />
    ) : null}
    {crease !== "none" && paths.bevel ? (
      <path className="iso-line iso-bevel" d={paths.bevel} data-tone={crease} />
    ) : null}
    {inner}
    <path className="iso-line iso-edge" d={paths.outline} data-tone={tone} />
    {children}
  </g>
);

export const Line = ({
  d,
  free = false,
  tone = "lo",
}: {
  d: string;
  free?: boolean;
  tone?: LineTone;
}) =>
  d ? (
    <path
      className="iso-line"
      d={d}
      data-free={free ? "" : undefined}
      data-tone={tone}
    />
  ) : null;

export const Dots = ({
  points,
  size = 0.5,
  tone = "mid",
}: {
  points: readonly Flat[];
  size?: number;
  tone?: Tone;
}) => (
  <g className="iso-dots" data-tone={tone}>
    {points.map(([x, y]) => (
      <circle
        cx={tenth(x)}
        cy={tenth(y)}
        key={`${tenth(x)} ${tenth(y)}`}
        r={size}
      />
    ))}
  </g>
);

export const FaceText = ({
  anchor = "start",
  children,
  size,
  strong = false,
  tone = "mid",
  transform,
  x = 0,
  y = 0,
}: {
  anchor?: "start" | "middle" | "end";
  children: ReactNode;
  size: number;
  strong?: boolean;
  tone?: LineTone;
  transform: string;
  x?: number;
  y?: number;
}) => (
  <text
    className="iso-text"
    data-strong={strong ? "" : undefined}
    data-tone={tone}
    fontSize={size}
    textAnchor={anchor}
    transform={transform}
    x={x}
    y={y}
  >
    {children}
  </text>
);

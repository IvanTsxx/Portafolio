"use client";

import type { SolidPaths, Tone } from "@/components/iso/iso-kit";

export const LiveSolid = ({
  paths,
  tone = "mid",
}: {
  paths: SolidPaths;
  tone?: Tone;
}) => (
  <g className="iso-solid">
    <path className="iso-fill" d={paths.fill} />
    {[0, 1, 2, 3].map((shade) => (
      <path
        className="iso-shade"
        d={paths.shades[shade] ?? ""}
        data-shade={shade}
        key={shade}
      />
    ))}
    <path className="iso-top" d={paths.top} />
    <path className="iso-line iso-crease" d={paths.crease} data-tone="faint" />
    <path className="iso-line iso-edge" d={paths.outline} data-tone={tone} />
  </g>
);

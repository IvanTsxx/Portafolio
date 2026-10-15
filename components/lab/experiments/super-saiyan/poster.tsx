import { useId } from "react";

import { posterBitmap } from "./poster-bitmap";

const { columns, png, rows } = posterBitmap;

export const SuperSaiyanPoster = () => {
  const maskId = useId();
  return (
    <svg
      aria-hidden
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 0 ${columns} ${rows}`}
    >
      <mask
        height={rows}
        id={maskId}
        maskUnits="userSpaceOnUse"
        width={columns}
        x={0}
        y={0}
      >
        <image
          height={rows}
          href={`data:image/png;base64,${png}`}
          preserveAspectRatio="none"
          style={{ imageRendering: "pixelated" }}
          width={columns}
        />
      </mask>
      <rect
        className="fill-ink"
        height={rows}
        mask={`url(#${maskId})`}
        width={columns}
      />
    </svg>
  );
};

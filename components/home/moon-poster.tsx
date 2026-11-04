import { useId } from "react";

export const MoonPoster = ({ className }: { className?: string }) => {
  const id = useId();
  return (
    <svg aria-hidden className={className} viewBox="0 0 400 400">
      <defs>
        <pattern
          height="4"
          id={`${id}-dots`}
          patternUnits="userSpaceOnUse"
          width="4"
        >
          <rect fill="currentColor" height="2" width="2" />
        </pattern>
        <radialGradient cx="38%" cy="40%" id={`${id}-light`} r="70%">
          <stop offset="0" stopColor="white" />
          <stop offset="0.55" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <circle cx="200" cy="200" fill={`url(#${id}-light)`} r="180" />
        </mask>
      </defs>
      <circle
        cx="200"
        cy="200"
        fill={`url(#${id}-dots)`}
        mask={`url(#${id}-mask)`}
        r="180"
      />
    </svg>
  );
};

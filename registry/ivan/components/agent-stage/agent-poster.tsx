import type { ReactNode } from "react";

import type { AgentRole } from "@/registry/ivan/components/agent/types";

export interface AgentPosterProps {
  role: AgentRole;
  label?: string;
  className?: string;
}

interface PosterKit {
  body?: ReactNode;
  face?: ReactNode;
  head?: ReactNode;
  props?: ReactNode;
}

const colors = {
  brass: "#d9a946",
  clay: "#f48d58",
  clayDeep: "#e07a45",
  ink: "#08080a",
  paper: "#efe7d3",
  white: "#efece4",
} as const;

const eyeCenters = [48, 112] as const;
const legCenters = [40, 64, 96, 120] as const;

const HardHat = ({ color }: { color: string }) => (
  <>
    <path d="M42 52 C42 26 118 26 118 52 Z" fill={color} />
    <rect fill={color} height="6" rx="3" width="92" x="34" y="49" />
    <rect
      fill={colors.ink}
      height="20"
      opacity="0.1"
      rx="2"
      width="8"
      x="76"
      y="30"
    />
  </>
);

const posterKits = {
  analyst: {
    body: (
      <>
        <rect
          fill={colors.white}
          height="38"
          rx="12"
          width="100"
          x="30"
          y="94"
        />
        <path d="M80 94 L68 112 L80 118 L92 112 Z" fill={colors.paper} />
      </>
    ),
    head: (
      <>
        <rect fill="#2f9e95" height="6" rx="3" width="88" x="36" y="44" />
        <circle
          cx="62"
          cy="44"
          fill="#e6f1ff"
          r="9"
          stroke="#2f9e95"
          strokeWidth="3"
        />
        <circle
          cx="98"
          cy="44"
          fill="#e6f1ff"
          r="9"
          stroke="#2f9e95"
          strokeWidth="3"
        />
      </>
    ),
    props: (
      <path
        d="M130 100 L152 74"
        stroke="#d33a35"
        strokeLinecap="round"
        strokeWidth="4"
      />
    ),
  },
  architect: {
    head: <HardHat color={colors.white} />,
    props: (
      <>
        <rect fill="#2f5c98" height="34" rx="4" width="16" x="12" y="88" />
        <rect fill={colors.paper} height="3" width="16" x="12" y="96" />
      </>
    ),
  },
  builder: {
    body: (
      <>
        {[36, 102].map((x) => (
          <g key={x}>
            <rect fill="#c3cc4a" height="44" rx="3" width="22" x={x} y="88" />
            <rect fill="#c9ccd0" height="5" width="22" x={x} y="112" />
          </g>
        ))}
      </>
    ),
    head: <HardHat color="#f2b42e" />,
  },
  debugger: {
    body: (
      <>
        <rect fill="#d6c39a" height="38" rx="12" width="100" x="30" y="94" />
        <path
          d="M46 94 V132 M62 94 V132 M78 94 V132 M94 94 V132 M110 94 V132 M30 108 H130 M30 122 H130"
          stroke="#8d7452"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
      </>
    ),
    head: (
      <>
        <rect fill="#d6c39a" height="26" rx="13" width="88" x="36" y="28" />
        <path
          d="M52 28 V54 M68 28 V54 M84 28 V54 M100 28 V54 M36 41 H124"
          stroke="#8d7452"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <rect fill="#8d7452" height="5" rx="2" width="40" x="60" y="50" />
      </>
    ),
    props: (
      <>
        <path
          d="M138 106 L130 120"
          stroke="#5a3a24"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <circle
          cx="144"
          cy="94"
          fill="#e6f1ff"
          fillOpacity="0.55"
          r="12"
          stroke={colors.brass}
          strokeWidth="4"
        />
      </>
    ),
  },
  inspector: {
    head: <HardHat color="#7d93ab" />,
    props: (
      <>
        <rect fill="#5a3a24" height="32" rx="3" width="22" x="10" y="86" />
        <rect fill={colors.paper} height="22" width="16" x="13" y="92" />
        <rect fill={colors.brass} height="5" rx="2" width="10" x="16" y="84" />
      </>
    ),
  },
  orchestrator: {
    face: (
      <>
        <rect fill="#16171a" height="16" rx="2" width="36" x="30" y="64" />
        <rect fill="#16171a" height="16" rx="2" width="36" x="94" y="64" />
        <rect fill="#16171a" height="5" width="28" x="66" y="68" />
        <rect
          fill={colors.white}
          height="3"
          opacity="0.6"
          width="6"
          x="35"
          y="67"
        />
        <rect
          fill={colors.white}
          height="3"
          opacity="0.6"
          width="6"
          x="99"
          y="67"
        />
      </>
    ),
    head: (
      <>
        <path
          d="M36 64 C36 22 124 22 124 64"
          fill="none"
          stroke="#16171a"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <rect fill="#16171a" height="22" rx="4" width="10" x="26" y="60" />
        <rect fill="#16171a" height="22" rx="4" width="10" x="124" y="60" />
      </>
    ),
    props: (
      <>
        <rect fill="#16171a" height="32" rx="4" width="22" x="10" y="86" />
        <rect fill="#8fb4e0" height="24" rx="2" width="16" x="13" y="90" />
      </>
    ),
  },
  researcher: {
    body: <rect fill="#b59d7c" height="38" rx="12" width="100" x="30" y="94" />,
    face: (
      <>
        {eyeCenters.map((cx) => (
          <circle
            cx={cx}
            cy="72"
            fill="none"
            key={cx}
            r="12"
            stroke={colors.brass}
            strokeWidth="3"
          />
        ))}
        <path d="M60 72 H100" stroke={colors.brass} strokeWidth="3" />
      </>
    ),
    head: (
      <>
        <rect fill="#5c5e63" height="18" rx="4" width="46" x="57" y="34" />
        <path d="M80 18 L130 33 L80 48 L30 33 Z" fill="#5c5e63" />
        <path d="M126 34 V54" stroke={colors.brass} strokeWidth="3" />
      </>
    ),
    props: (
      <>
        <rect
          fill={colors.paper}
          height="16"
          rx="2"
          width="48"
          x="56"
          y="110"
        />
        <path d="M80 110 V126" stroke="#9c3a2e" strokeWidth="2" />
      </>
    ),
  },
} as const satisfies Record<AgentRole, PosterKit>;

export const AgentPoster = ({ role, label, className }: AgentPosterProps) => {
  const kit: PosterKit = posterKits[role];
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={className}
      fill="none"
      role={label ? "img" : undefined}
      viewBox="0 0 160 160"
    >
      <ellipse cx="80" cy="148" fill="#3b2a1f" opacity="0.22" rx="56" ry="7" />
      {legCenters.map((cx) => (
        <rect
          fill={colors.clayDeep}
          height="20"
          key={cx}
          rx="4"
          width="14"
          x={cx - 7}
          y="130"
        />
      ))}
      <rect fill={colors.clay} height="82" rx="12" width="100" x="30" y="50" />
      <rect
        fill="#fff"
        height="6"
        opacity="0.2"
        rx="3"
        width="44"
        x="36"
        y="55"
      />
      {kit.body}
      <rect
        fill={colors.clayDeep}
        height="28"
        rx="7"
        width="18"
        x="20"
        y="84"
      />
      <rect
        fill={colors.clayDeep}
        height="28"
        rx="7"
        width="18"
        x="122"
        y="84"
      />
      {eyeCenters.map((cx) => (
        <g key={cx}>
          <rect
            fill={colors.ink}
            height="14"
            rx="3"
            width="14"
            x={cx - 7}
            y="65"
          />
          <rect fill="#fff" height="4" rx="1" width="4" x={cx - 5} y="67" />
        </g>
      ))}
      {kit.face}
      {kit.head}
      {kit.props}
    </svg>
  );
};

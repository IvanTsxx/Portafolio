import { cn } from "@/lib/utils";

const isoAgent = (x: number, y: number, key: string) => (
  <g key={key} transform={`translate(${x} ${y})`}>
    <path className="fill-clay" d="M0 -14 L14 -7 L0 0 L-14 -7 Z" />
    <path className="fill-clay-deep" d="M-14 -7 L0 0 L0 16 L-14 9 Z" />
    <path className="fill-clay opacity-80" d="M0 0 L14 -7 L14 9 L0 16 Z" />
  </g>
);

const SchematicFrame = ({
  children,
  className,
  viewBox,
}: {
  children: React.ReactNode;
  className?: string;
  viewBox: string;
}) => (
  <svg
    aria-hidden
    className={cn("size-full select-none", className)}
    fill="none"
    preserveAspectRatio="xMidYMid meet"
    viewBox={viewBox}
  >
    {children}
  </svg>
);

export const HeroSceneFallback = () => (
  <SchematicFrame viewBox="0 0 640 440">
    <g className="stroke-faint" strokeWidth="1">
      <path d="M170 250 L330 170 L470 240 L310 320 Z" />
      <path d="M170 250 L170 262 L310 332 L310 320" />
      <path d="M310 332 L470 252 L470 240" />
      <path d="M240 210 L240 160 L290 135 L290 185" />
      <path d="M300 180 L300 130 L350 105 L350 155" />
      <path d="M430 140 L520 95 L520 160 L430 205 Z" />
    </g>
    {isoAgent(230, 300, "builder")}
    {isoAgent(330, 350, "orchestrator")}
    {isoAgent(470, 200, "architect")}
    {isoAgent(520, 300, "researcher")}
    {isoAgent(130, 330, "debugger")}
  </SchematicFrame>
);

export const WorkshopSceneFallback = () => (
  <SchematicFrame viewBox="0 0 800 300">
    <g className="stroke-rule-strong" strokeWidth="1">
      <line x1="40" x2="240" y1="150" y2="150" />
      <line x1="560" x2="760" y1="150" y2="150" />
      <path d="M240 150 C280 150 280 80 320 80 L520 80 C540 80 540 150 560 150" />
      <line x1="240" x2="560" y1="150" y2="150" />
      <path d="M240 150 C280 150 280 220 320 220 L520 220 C540 220 540 150 560 150" />
    </g>
    <rect
      className="stroke-signal-steel"
      height="28"
      width="44"
      x="40"
      y="136"
    />
    <rect className="fill-clay" height="28" width="44" x="716" y="136" />
    {isoAgent(170, 120, "orchestrator")}
    {isoAgent(420, 64, "researcher")}
    {isoAgent(420, 134, "builder")}
    {isoAgent(420, 204, "debugger")}
    {isoAgent(620, 120, "inspector")}
  </SchematicFrame>
);

export const SingleAgentFallback = () => (
  <SchematicFrame viewBox="0 0 320 240">
    <ellipse className="stroke-rule-strong" cx="160" cy="160" rx="90" ry="34" />
    <g transform="translate(160 150) scale(2.4)">{isoAgent(0, 0, "solo")}</g>
  </SchematicFrame>
);

export const DebuggerSceneFallback = () => (
  <SchematicFrame viewBox="0 0 320 240">
    <g className="stroke-signal-steel" strokeWidth="1.5">
      <path d="M40 170 L120 130" />
      <path d="M136 124 L176 108" />
      <path d="M196 116 L280 80" strokeDasharray="4 6" />
    </g>
    <g transform="translate(170 160) scale(2)">{isoAgent(0, 0, "debugger")}</g>
    <circle
      className="stroke-foreground"
      cx="214"
      cy="118"
      r="14"
      strokeWidth="2"
    />
    <line
      className="stroke-foreground"
      strokeWidth="2"
      x1="204"
      x2="194"
      y1="128"
      y2="140"
    />
  </SchematicFrame>
);

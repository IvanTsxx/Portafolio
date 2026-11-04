import { cn } from "@/lib/utils";

const radius = 7;

const litPath = (phase: number) => {
  const angle = phase * 2 * Math.PI;
  const terminator = Math.abs(Math.cos(angle)) * radius;
  const isWaxing = phase < 0.5;
  const outerSweep = isWaxing ? 1 : 0;
  const isGibbous = phase > 0.25 && phase < 0.75;
  const innerSweep = isGibbous === isWaxing ? 1 : 0;
  return `M8 1 A${radius} ${radius} 0 0 ${outerSweep} 8 15 A${terminator} ${radius} 0 0 ${innerSweep} 8 1Z`;
};

export const PhaseGlyph = ({
  className,
  phase,
}: {
  className?: string;
  phase: number;
}) => (
  <svg
    aria-hidden
    className={cn("text-signal size-4 shrink-0", className)}
    fill="none"
    viewBox="0 0 16 16"
  >
    <circle cx="8" cy="8" r={radius} stroke="currentColor" strokeWidth="1" />
    {phase > 0.02 && phase < 0.98 ? (
      <path d={litPath(phase)} fill="currentColor" />
    ) : null}
  </svg>
);

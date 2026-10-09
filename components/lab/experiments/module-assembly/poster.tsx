import { moduleLayouts } from "./layouts";
import type { ModuleTone } from "./layouts";

const toneClass = {
  ink: "fill-foreground/80",
  panel: "fill-muted-foreground/25",
  plate: "fill-graphite stroke-rule-strong",
} as const satisfies Record<ModuleTone, string>;

const looseModules = [
  { rotate: 24, size: 0.7, x: 12.6, y: 1.2 },
  { rotate: -18, size: 0.5, x: 13.4, y: 3.1 },
  { rotate: 41, size: 0.9, x: 12.2, y: 5.4 },
  { rotate: -32, size: 0.6, x: 14, y: 6.6 },
  { rotate: 12, size: 0.45, x: 11.4, y: 7.6 },
] as const;

export const ModuleAssemblyPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid meet"
    viewBox="-2 -1.5 18 11"
  >
    {moduleLayouts.card.map((slot, slotIndex) => (
      <rect
        className={toneClass[slot.tone]}
        height={slot.height - 0.08}
        key={`slot-${slotIndex.toString()}`}
        strokeWidth={0.04}
        width={slot.width - 0.08}
        x={slot.x}
        y={slot.y}
      />
    ))}
    {looseModules.map((module) => (
      <rect
        className="fill-muted-foreground/40"
        height={module.size}
        key={`${module.x}-${module.y}`}
        transform={`rotate(${module.rotate} ${module.x + module.size / 2} ${module.y + module.size / 2})`}
        width={module.size}
        x={module.x}
        y={module.y}
      />
    ))}
    <rect
      className="fill-clay"
      height={1.1}
      rx={0.12}
      width={1.4}
      x={-0.8}
      y={7.4}
    />
  </svg>
);

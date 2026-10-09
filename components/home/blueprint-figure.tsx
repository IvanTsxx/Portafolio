import type { BlueprintKind } from "@/lib/home/content";

const SceneBlueprint = () => (
  <>
    <path d="M60 150 L160 100 L260 150 L160 200 Z" />
    <path d="M60 150 L60 160 L160 210 L260 160 L260 150" />
    <path d="M130 120 L130 70 L180 45 L230 70 L230 120" strokeDasharray="3 5" />
    <circle cx="160" cy="150" r="22" />
    <path d="M160 128 L160 60" strokeDasharray="2 4" />
    <path className="stroke-clay" d="M150 150 L160 145 L170 150 L160 155 Z" />
    <path d="M280 60 L300 60 M290 50 L290 70" />
  </>
);

const ScrollBlueprint = () => (
  <>
    <rect height="160" width="70" x="40" y="30" />
    <rect className="stroke-clay" height="40" width="70" x="40" y="80" />
    <path d="M130 100 L170 100" strokeDasharray="3 5" />
    {[0, 1, 2, 3].map((step) => (
      <rect height="28" key={step} width="110" x="180" y={34 + step * 40} />
    ))}
    <path d="M300 34 L300 190" />
    <path d="M296 80 L304 80 M296 120 L304 120" />
  </>
);

const SystemBlueprint = () => (
  <>
    {[0, 1, 2].map((column) =>
      [0, 1].map((row) => (
        <rect
          height="56"
          key={`${column}-${row}`}
          width="72"
          x={50 + column * 88}
          y={44 + row * 72}
        />
      ))
    )}
    <rect className="stroke-clay" height="56" width="72" x="138" y="44" />
    <path
      d="M86 100 L86 116 M174 100 L174 116 M262 100 L262 116"
      strokeDasharray="2 3"
    />
    <path d="M40 200 L320 200" />
    <path d="M40 196 L40 204 M320 196 L320 204" />
  </>
);

const blueprints = {
  scene: SceneBlueprint,
  scroll: ScrollBlueprint,
  system: SystemBlueprint,
} as const satisfies Record<BlueprintKind, () => React.ReactNode>;

export const BlueprintFigure = ({ kind }: { kind: BlueprintKind }) => {
  const Drawing = blueprints[kind];
  return (
    <svg
      aria-hidden
      className="stroke-signal-steel/70 size-full select-none"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      strokeWidth="1"
      viewBox="0 0 360 230"
    >
      <Drawing />
    </svg>
  );
};

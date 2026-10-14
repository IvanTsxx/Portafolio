const width = 48;
const height = 27;
const label = "RECEIVED";
const glyphAdvance = 0.6;
const fontSize = 3.4;
const sidePadding = 1.8;
const stampWidth = label.length * glyphAdvance * fontSize + sidePadding * 2;
const stampHeight = 6.4;

const impressions = [
  { opacity: 1, rotation: -4, x: 14, y: 9 },
  { opacity: 0.72, rotation: 2.5, x: 30, y: 15 },
  { opacity: 0.45, rotation: -1.5, x: 17, y: 20.5 },
] as const;

const random = (() => {
  let state = 20_260_613;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return state / 2_147_483_648;
  };
})();

const speckles = Array.from({ length: 120 }, () => ({
  radius: (0.08 + random() * 0.22).toFixed(2),
  x: (random() * stampWidth).toFixed(2),
  y: (random() * stampHeight).toFixed(2),
}));

const maskId = "stamp-type-poster-wear";

export const StampTypePoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    <defs>
      <mask
        height={stampHeight}
        id={maskId}
        maskUnits="userSpaceOnUse"
        width={stampWidth}
        x={0}
        y={0}
      >
        <rect fill="white" height={stampHeight} width={stampWidth} />
        {speckles.map((speckle) => (
          <circle
            cx={speckle.x}
            cy={speckle.y}
            fill="black"
            key={`${speckle.x}-${speckle.y}`}
            r={speckle.radius}
          />
        ))}
      </mask>
    </defs>
    {impressions.map((impression) => (
      <g
        key={`${impression.x}-${impression.y}`}
        mask={`url(#${maskId})`}
        opacity={impression.opacity}
        transform={`translate(${impression.x - stampWidth / 2} ${impression.y - stampHeight / 2}) rotate(${impression.rotation} ${stampWidth / 2} ${stampHeight / 2})`}
      >
        <rect
          className="stroke-ink"
          fill="none"
          height={stampHeight - 0.6}
          strokeWidth={0.36}
          width={stampWidth - 0.6}
          x={0.3}
          y={0.3}
        />
        <rect
          className="stroke-ink"
          fill="none"
          height={stampHeight - 1.6}
          strokeWidth={0.12}
          width={stampWidth - 1.6}
          x={0.8}
          y={0.8}
        />
        <text
          className="fill-ink font-mono"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={600}
          x={sidePadding}
          y={stampHeight / 2}
        >
          {label}
        </text>
      </g>
    ))}
  </svg>
);

const columns = 12;
const rows = 8;
const pinned = { column: 7, row: 3 };

export const BlueprintIntersectionsPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`-1 -1 ${columns + 2} ${rows + 2}`}
  >
    <g className="stroke-rule-strong" strokeWidth={0.02}>
      {Array.from({ length: columns + 1 }, (_, column) => (
        <line
          key={`column-${column.toString()}`}
          x1={column}
          x2={column}
          y1={0}
          y2={rows}
        />
      ))}
      {Array.from({ length: rows + 1 }, (_, row) => (
        <line
          key={`row-${row.toString()}`}
          x1={0}
          x2={columns}
          y1={row}
          y2={row}
        />
      ))}
    </g>
    <rect
      className="fill-clay/15 stroke-clay"
      height={1}
      strokeWidth={0.04}
      width={1}
      x={pinned.column}
      y={pinned.row}
    />
    <g className="stroke-clay" strokeWidth={0.03}>
      <line
        x1={pinned.column + 0.5}
        x2={pinned.column + 0.5}
        y1={-1}
        y2={rows + 1}
      />
      <line
        x1={-1}
        x2={columns + 1}
        y1={pinned.row + 0.5}
        y2={pinned.row + 0.5}
      />
    </g>
    <text
      className="fill-muted-foreground font-mono"
      fontSize={0.32}
      x={pinned.column + 1.15}
      y={pinned.row - 0.2}
    >
      H·04
    </text>
  </svg>
);

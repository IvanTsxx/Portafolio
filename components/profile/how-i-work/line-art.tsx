import { Ball, Dots, Line, Solid } from "@/components/iso/draw";

import {
  BASE,
  CONSOLE,
  INDEX_PIN,
  NESTS,
  STATIONS,
  TABLE,
} from "./line-geometry";
import type { StationArt } from "./line-geometry";
import type { Part } from "./line-kit";
import { nestView, restLine } from "./line-model";
import { LINE_HEIGHT, LINE_WIDTH } from "./line-view";

const keyOf = (part: Part) => {
  switch (part.kind) {
    case "solid": {
      return part.paths.outline;
    }
    case "line":
    case "halo": {
      return part.d;
    }
    case "dots": {
      return part.points.map(([x, y]) => `${x},${y}`).join(" ");
    }
    case "ball": {
      return `${part.center[0]},${part.center[1]}`;
    }
    case "group": {
      return `${part.name}-${part.value ?? ""}`;
    }
    default: {
      return "";
    }
  }
};

const keyed = (parts: readonly Part[]) => {
  const seen = new Map<string, number>();
  return parts.map((part) => {
    const base = `${part.kind}:${keyOf(part)}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { key: count ? `${base}#${count}` : base, part };
  });
};

const PartView = ({ part }: { part: Part }) => {
  switch (part.kind) {
    case "solid": {
      return (
        <Solid
          crease={part.crease}
          inner={part.inner ? <Line d={part.inner} tone="faint" /> : null}
          paths={part.paths}
          tone={part.tone}
        />
      );
    }
    case "line": {
      return part.name ? (
        <path
          className="iso-line"
          d={part.d}
          data-piece={part.name}
          data-tone={part.tone}
        />
      ) : (
        <Line d={part.d} free={part.free} tone={part.tone} />
      );
    }
    case "dots": {
      return <Dots points={part.points} size={part.size} tone={part.tone} />;
    }
    case "halo": {
      return <path className="iso-halo" d={part.d} />;
    }
    case "ball": {
      return (
        <Ball center={part.center} radius={part.radius} shine={part.shine} />
      );
    }
    case "group": {
      return (
        <g
          data-piece={part.name}
          data-value={part.value}
          opacity={part.opacity}
        >
          {keyed(part.parts).map(({ key, part: child }) => (
            <PartView key={key} part={child} />
          ))}
        </g>
      );
    }
    default: {
      return null;
    }
  }
};

const Parts = ({ parts }: { parts: readonly Part[] }) => (
  <>
    {keyed(parts).map(({ key, part }) => (
      <PartView key={key} part={part} />
    ))}
  </>
);

const stationLayer = (
  station: StationArt,
  index: number,
  layer: "body" | "head"
) => (
  <g
    data-part={`station-${index}`}
    data-station={index}
    key={`${layer}-${index}`}
  >
    {layer === "body" ? (
      <Parts parts={station.body} />
    ) : (
      <>
        <g data-tool={index}>
          <Parts parts={station.tool} />
        </g>
        <Parts parts={station.head} />
        <g data-tool={index}>
          <Parts parts={station.crown} />
        </g>
      </>
    )}
  </g>
);

const withIndex = STATIONS.map((station, index) => ({ index, station }));
const byDepth = withIndex.toSorted((a, b) => a.station.depth - b.station.depth);
const behind = byDepth.filter(({ station }) => !station.isFront);
const front = byDepth.filter(({ station }) => station.isFront);

const nestGroup = (parts: readonly Part[], index: number) => {
  const view = nestView(index, restLine);
  return (
    <g data-nest={index} key={index}>
      {keyed(parts).map(({ key, part }) =>
        part.kind === "group" && part.name === "puck" ? (
          <g
            data-on={index === 0 ? "" : undefined}
            data-piece="puck"
            key={key}
            opacity={view.alpha}
          >
            {part.parts.map((feature) => (
              <g
                data-piece="feature"
                key={feature.kind === "group" ? feature.value : keyOf(feature)}
                opacity={
                  Number(feature.kind === "group" ? feature.value : 0) <=
                  view.stage
                    ? 1
                    : 0
                }
              >
                {feature.kind === "group" ? (
                  <Parts parts={feature.parts} />
                ) : null}
              </g>
            ))}
          </g>
        ) : (
          <PartView key={key} part={part} />
        )
      )}
    </g>
  );
};

export const lineDrawing = () => (
  <svg
    aria-hidden
    className="iso-svg"
    focusable="false"
    key="line-drawing"
    viewBox={`0 0 ${LINE_WIDTH} ${LINE_HEIGHT}`}
  >
    <g data-part="base">
      <Parts parts={BASE} />
    </g>
    {behind.map(({ index, station }) => stationLayer(station, index, "body"))}
    <g data-part="table">
      <Parts parts={TABLE} />
      {NESTS.map(nestGroup)}
    </g>
    {behind.map(({ index, station }) => stationLayer(station, index, "head"))}
    <g data-part="base">
      <Parts parts={INDEX_PIN.housing} />
      <g data-piece="pin">
        <Parts parts={INDEX_PIN.pin} />
      </g>
    </g>
    {front.map(({ index, station }) => (
      <g key={`front-${index}`}>
        {stationLayer(station, index, "body")}
        {stationLayer(station, index, "head")}
      </g>
    ))}
    <g data-console="" data-part="console">
      <Parts parts={CONSOLE.body} />
      {CONSOLE.buttons.map(({ at, parts }, index) => (
        <g data-control={index} key={at}>
          <Parts parts={parts} />
        </g>
      ))}
    </g>
  </svg>
);

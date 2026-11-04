import type { CSSProperties, ReactNode } from "react";

import {
  MoonLine,
  MoonOnOrbit,
  TucumanTime,
} from "@/components/underside/underside-readouts";
import {
  monogramGlyphPath,
  monogramIncision,
  monogramIncisionWidth,
} from "@/lib/site/monogram";
import { recentCommits, siteRevision } from "@/lib/site/revision";

const accentStyle: CSSProperties = {
  color: "color-mix(in oklch, var(--signal) 55%, var(--background))",
};

const groundStyle: CSSProperties = {
  backgroundImage: [
    "linear-gradient(to right, color-mix(in oklch, var(--background) 9%, transparent) 1px, transparent 1px)",
    "linear-gradient(to bottom, color-mix(in oklch, var(--background) 9%, transparent) 1px, transparent 1px)",
    "linear-gradient(to right, color-mix(in oklch, var(--background) 4%, transparent) 1px, transparent 1px)",
    "linear-gradient(to bottom, color-mix(in oklch, var(--background) 4%, transparent) 1px, transparent 1px)",
  ].join(", "),
  backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
};

const remUnit = 12;
const frame = { left: 80, right: 80 + 72 * remUnit };
const gutter = 2 * remUnit;
const columnGap = 2 * remUnit;
const contentLeft = frame.left + gutter;
const contentRight = frame.right - gutter;
const columnWidth = (contentRight - contentLeft - 11 * columnGap) / 12;
const columnLeft = (index: number) =>
  contentLeft + index * (columnWidth + columnGap);
const plateRight = columnLeft(3) + columnWidth;
const mainLeft = columnLeft(4);
const columnInset = 2 * remUnit;
const sheetTop = 200;
const sheetBottom = 780;
const headerBottom = sheetTop + 3.5 * remUnit;
const sectionGap = 6 * remUnit;
const sectionHeight = 100;
const sections = [
  290,
  290 + sectionHeight + sectionGap,
  290 + 2 * (sectionHeight + sectionGap),
];
const gridColumns = Array.from({ length: 12 }, (_, index) => columnLeft(index));

const incisionDegrees = (
  (Math.atan2(
    monogramIncision.y1 - monogramIncision.y2,
    monogramIncision.x2 - monogramIncision.x1
  ) *
    180) /
  Math.PI
).toFixed(1);

const monogramScale = 3.2;
const monogramOrigin = { x: 1100, y: 64 };
const toMonogram = (x: number, y: number) => ({
  x: monogramOrigin.x + x * monogramScale,
  y: monogramOrigin.y + y * monogramScale,
});
const incisionStart = toMonogram(monogramIncision.x1, monogramIncision.y1);
const incisionEnd = toMonogram(monogramIncision.x2, monogramIncision.y2);
const incisionReach = {
  x: (incisionEnd.x - incisionStart.x) * 0.35,
  y: (incisionEnd.y - incisionStart.y) * 0.35,
};

const moon = { cx: 1190, cy: 560, orbit: 112 };

const callouts = [
  {
    detail: "Capital I with one diagonal incision.",
    title: `Monogram, cut at ${incisionDegrees}°`,
  },
  {
    detail: "Sticky, 3.5rem tall, blurred over the page.",
    title: "Header",
  },
  {
    detail:
      "Twelve columns, 2rem gaps. A sticky plate takes 4, content takes 8.",
    title: "Plate grid",
  },
  {
    detail: "Every section on an index page sits 6rem apart.",
    title: "Section gap",
  },
  {
    detail: "Tonight's real phase over Tucumán, computed in the browser.",
    title: "Moon",
  },
  {
    detail: "One fixed WebGL canvas at z 30. Every 3D view draws into it.",
    title: "Shared canvas",
  },
  {
    detail: "One fixed noise layer over everything. 5% in light, 7% in dark.",
    title: "Grain",
  },
] as const;

const Dimension = ({
  label,
  x1,
  x2,
  y,
}: {
  label: string;
  x1: number;
  x2: number;
  y: number;
}) => (
  <g>
    <line stroke="currentColor" x1={x1} x2={x2} y1={y} y2={y} />
    <line stroke="currentColor" x1={x1} x2={x1} y1={y - 6} y2={y + 6} />
    <line stroke="currentColor" x1={x2} x2={x2} y1={y - 6} y2={y + 6} />
    <text
      className="font-mono"
      fill="currentColor"
      fontSize={12}
      letterSpacing="0.08em"
      textAnchor="middle"
      x={(x1 + x2) / 2}
      y={y - 10}
    >
      {label}
    </text>
  </g>
);

const Callout = ({
  index,
  target,
  tag,
}: {
  index: number;
  tag: { x: number; y: number };
  target: { x: number; y: number };
}) => (
  <g style={accentStyle}>
    <line
      stroke="currentColor"
      x1={target.x}
      x2={tag.x}
      y1={target.y}
      y2={tag.y}
    />
    <circle cx={target.x} cy={target.y} fill="currentColor" r={3} />
    <circle
      cx={tag.x}
      cy={tag.y}
      fill="var(--foreground)"
      r={13}
      stroke="currentColor"
    />
    <text
      className="font-mono"
      fill="currentColor"
      fontSize={12}
      textAnchor="middle"
      x={tag.x}
      y={tag.y + 4}
    >
      {index}
    </text>
  </g>
);

const DrawingDefs = () => (
  <defs>
    <pattern
      height="8"
      id="underside-hatch"
      patternTransform="rotate(-45)"
      patternUnits="userSpaceOnUse"
      width="8"
    >
      <line
        stroke="currentColor"
        strokeOpacity={0.35}
        x1="0"
        x2="0"
        y1="0"
        y2="8"
      />
    </pattern>
    <mask id="underside-incision">
      <rect fill="white" height="64" width="64" />
      <line
        stroke="black"
        strokeWidth={monogramIncisionWidth.mark}
        {...monogramIncision}
      />
    </mask>
  </defs>
);

const PlateGrid = () => (
  <g>
    <Dimension label="frame · 72rem" x1={frame.left} x2={frame.right} y={120} />
    <Dimension label="2rem" x1={frame.left} x2={contentLeft} y={160} />
    <Dimension label="plate · 4/12" x1={contentLeft} x2={plateRight} y={160} />
    <Dimension label="2rem" x1={plateRight} x2={mainLeft} y={160} />
    <Dimension
      label="content · 8/12 · 12 col grid"
      x1={mainLeft}
      x2={contentRight}
      y={160}
    />
    {gridColumns.map((left) => (
      <rect
        fill="currentColor"
        fillOpacity={0.05}
        height={sheetBottom - headerBottom}
        key={left}
        stroke="none"
        width={columnWidth}
        x={left}
        y={headerBottom}
      />
    ))}
  </g>
);

const SheetPlan = () => (
  <g fill="none" strokeWidth={1}>
    <PlateGrid />
    <rect
      height={sheetBottom - sheetTop}
      stroke="currentColor"
      width={frame.right - frame.left}
      x={frame.left}
      y={sheetTop}
    />
    <line
      stroke="currentColor"
      x1={frame.left}
      x2={frame.right}
      y1={headerBottom}
      y2={headerBottom}
    />
    <g fill="currentColor" stroke="none">
      <rect height={14} width={10} x={contentLeft} y={sheetTop + 14} />
      {[0, 1, 2, 3, 4].map((item) => (
        <rect
          fillOpacity={0.5}
          height={2}
          key={item}
          width={36}
          x={mainLeft + 120 + item * 60}
          y={sheetTop + 20}
        />
      ))}
    </g>
    <g>
      <rect
        fill="url(#underside-hatch)"
        height={190}
        stroke="currentColor"
        strokeOpacity={0.6}
        width={plateRight - contentLeft - 2 * columnInset}
        x={contentLeft + columnInset}
        y={290}
      />
      <circle
        cx={(contentLeft + plateRight) / 2}
        cy={560}
        r={48}
        stroke="currentColor"
      />
      {[640, 656, 672].map((top) => (
        <line
          key={top}
          stroke="currentColor"
          strokeOpacity={0.6}
          x1={contentLeft + columnInset}
          x2={plateRight - columnInset}
          y1={top}
          y2={top}
        />
      ))}
      <text
        className="font-mono"
        fill="currentColor"
        fillOpacity={0.7}
        fontSize={11}
        letterSpacing="0.14em"
        stroke="none"
        x={contentLeft + columnInset}
        y={710}
      >
        STICKY PLATE
      </text>
    </g>
    {sections.map((top, index) => (
      <g key={top}>
        <rect
          fill="url(#underside-hatch)"
          height={sectionHeight}
          stroke="currentColor"
          strokeOpacity={0.6}
          width={contentRight - mainLeft - 2 * columnInset}
          x={mainLeft + columnInset}
          y={top}
        />
        <text
          className="font-mono"
          fill="currentColor"
          fillOpacity={0.7}
          fontSize={11}
          letterSpacing="0.14em"
          stroke="none"
          x={mainLeft + columnInset}
          y={top - 8}
        >
          {`0${index + 1}`}
        </text>
      </g>
    ))}
    <line
      stroke="currentColor"
      x1={frame.right + 24}
      x2={frame.right + 24}
      y1={(sections[0] ?? 0) + sectionHeight}
      y2={sections[1] ?? 0}
    />
    <line
      stroke="currentColor"
      x1={frame.right + 18}
      x2={frame.right + 30}
      y1={(sections[0] ?? 0) + sectionHeight}
      y2={(sections[0] ?? 0) + sectionHeight}
    />
    <line
      stroke="currentColor"
      x1={frame.right + 18}
      x2={frame.right + 30}
      y1={sections[1] ?? 0}
      y2={sections[1] ?? 0}
    />
    <text
      className="font-mono"
      fill="currentColor"
      fontSize={12}
      letterSpacing="0.08em"
      stroke="none"
      x={frame.right + 36}
      y={(sections[0] ?? 0) + sectionHeight + sectionGap / 2 + 4}
    >
      6rem
    </text>
    <rect
      height={sheetBottom - sheetTop}
      stroke="currentColor"
      strokeDasharray="6 6"
      style={accentStyle}
      width={frame.right - frame.left}
      x={frame.left + 14}
      y={sheetTop + 14}
    />
  </g>
);

const MonogramDetail = () => (
  <g fill="none" strokeWidth={1}>
    <g>
      <g
        transform={`translate(${monogramOrigin.x} ${monogramOrigin.y}) scale(${monogramScale})`}
      >
        <path
          d={monogramGlyphPath}
          fill="currentColor"
          mask="url(#underside-incision)"
          stroke="none"
        />
      </g>
      <g style={accentStyle}>
        <line
          stroke="currentColor"
          strokeDasharray="4 4"
          x1={incisionStart.x - incisionReach.x}
          x2={incisionEnd.x + incisionReach.x}
          y1={incisionStart.y - incisionReach.y}
          y2={incisionEnd.y + incisionReach.y}
        />
        <line
          stroke="currentColor"
          strokeDasharray="4 4"
          x1={incisionStart.x - 60}
          x2={incisionStart.x + 150}
          y1={incisionStart.y}
          y2={incisionStart.y}
        />
        <path
          d={`M ${incisionStart.x + 72} ${incisionStart.y} A 72 72 0 0 0 ${incisionStart.x + 72 * Math.cos((Number(incisionDegrees) * Math.PI) / 180)} ${incisionStart.y - 72 * Math.sin((Number(incisionDegrees) * Math.PI) / 180)}`}
          stroke="currentColor"
        />
        <text
          className="font-mono"
          fill="currentColor"
          fontSize={12}
          stroke="none"
          x={incisionStart.x + 80}
          y={incisionStart.y - 18}
        >
          {`${incisionDegrees}°`}
        </text>
        <circle
          cx={monogramOrigin.x + 32 * monogramScale}
          cy={monogramOrigin.y + 32 * monogramScale}
          r={30 * monogramScale}
          stroke="currentColor"
          strokeOpacity={0.6}
        />
      </g>
      <text
        className="font-mono"
        fill="currentColor"
        fontSize={11}
        letterSpacing="0.14em"
        stroke="none"
        x={monogramOrigin.x}
        y={monogramOrigin.y + 64 * monogramScale + 40}
      >
        DETAIL A · MONOGRAM · 64 GRID
      </text>
    </g>
  </g>
);

const MoonDetail = () => (
  <g fill="none" strokeWidth={1}>
    <g>
      <circle
        cx={moon.cx}
        cy={moon.cy}
        r={moon.orbit}
        stroke="currentColor"
        strokeDasharray="2 6"
      />
      <circle
        cx={moon.cx}
        cy={moon.cy}
        r={moon.orbit * 0.62}
        stroke="currentColor"
        strokeOpacity={0.4}
      />
      <line
        stroke="currentColor"
        strokeOpacity={0.4}
        x1={moon.cx - moon.orbit - 24}
        x2={moon.cx + moon.orbit + 24}
        y1={moon.cy}
        y2={moon.cy}
      />
      <line
        stroke="currentColor"
        strokeOpacity={0.4}
        x1={moon.cx}
        x2={moon.cx}
        y1={moon.cy - moon.orbit - 24}
        y2={moon.cy + moon.orbit + 24}
      />
      <circle cx={moon.cx} cy={moon.cy} fill="currentColor" r={4} />
      <g style={accentStyle}>
        <MoonOnOrbit cx={moon.cx} cy={moon.cy} radius={moon.orbit} />
      </g>
      <text
        className="font-mono"
        fill="currentColor"
        fontSize={11}
        letterSpacing="0.14em"
        stroke="none"
        x={moon.cx - moon.orbit - 24}
        y={moon.cy + moon.orbit + 52}
      >
        DETAIL B · SYNODIC ORBIT · 29.53 D
      </text>
    </g>
  </g>
);

const calloutMarks = [
  { tag: { x: 1060, y: 60 }, target: incisionStart },
  {
    tag: { x: 40, y: sheetTop + 21 },
    target: { x: contentLeft, y: sheetTop + 21 },
  },
  { tag: { x: 40, y: 160 }, target: { x: frame.left, y: 160 } },
  {
    tag: { x: frame.right + 92, y: (sections[1] ?? 0) - 36 },
    target: { x: frame.right + 24, y: (sections[1] ?? 0) - 36 },
  },
  {
    tag: { x: moon.cx + moon.orbit + 40, y: moon.cy - moon.orbit },
    target: { x: moon.cx + 30, y: moon.cy - 30 },
  },
  {
    tag: { x: frame.right + 60, y: sheetBottom + 14 },
    target: { x: frame.right + 14, y: sheetBottom - 40 },
  },
  {
    tag: { x: 40, y: sheetBottom - 20 },
    target: { x: frame.left + 30, y: sheetBottom - 40 },
  },
];

const SheetDrawing = () => (
  <figure className="min-w-3xl">
    <svg aria-hidden className="h-auto w-full" viewBox="0 0 1400 820">
      <DrawingDefs />
      <SheetPlan />
      <MonogramDetail />
      <MoonDetail />
      {calloutMarks.map((mark, index) => (
        <Callout
          index={index + 1}
          key={`${mark.tag.x}-${mark.tag.y}`}
          tag={mark.tag}
          target={mark.target}
        />
      ))}
    </svg>
    <figcaption className="sr-only">
      Working drawing of this site: the page sheet with its columns and
      dimensions, the monogram construction and the moon on its orbit.
    </figcaption>
  </figure>
);

const TitleRow = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => (
  <div className="border-background/20 grid grid-cols-3 gap-4 border-t py-2 first:border-t-0">
    <dt className="label text-background/60">{label}</dt>
    <dd className="col-span-2 font-mono text-xs">{children}</dd>
  </div>
);

export const Underside = () => (
  <div className="bg-foreground text-background min-h-full" style={groundStyle}>
    <div className="max-w-frame mx-auto flex flex-col gap-12 px-5 pt-20 pb-16 md:px-8">
      <div className="flex flex-col gap-3">
        <p className="label text-background/60">Underside · Sheet 1 of 1</p>
        <h2 className="display text-display">How this page is drawn</h2>
      </div>
      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <SheetDrawing />
      </div>
      <div className="grid gap-12 lg:grid-cols-12">
        <ol className="flex flex-col gap-4 lg:col-span-5">
          {callouts.map((callout, index) => (
            <li className="flex gap-4" key={callout.title}>
              <span
                className="label grid size-7 shrink-0 place-items-center rounded-full border border-current tabular-nums"
                style={accentStyle}
              >
                {index + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-sm">{callout.title}</span>
                <span className="text-background/60 text-sm">
                  {callout.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-10 lg:col-span-7">
          <div className="relative">
            <dl className="border-background/40 border px-4 py-2">
              <TitleRow label="Sheet">Ivo · Observatory</TitleRow>
              <TitleRow label="Drawn by">Ivo</TitleRow>
              <TitleRow label="Place">Tucumán AR · 26.8°S 65.2°W</TitleRow>
              <TitleRow label="Local time">
                <TucumanTime />
              </TitleRow>
              <TitleRow label="Moon">
                <MoonLine />
              </TitleRow>
              <TitleRow label="Revision">{siteRevision}</TitleRow>
              <TitleRow label="Stack">
                Next 16 · React 19 · Tailwind 4 · R3F
              </TitleRow>
            </dl>
            <p
              className="label absolute -top-5 right-4 -rotate-6 border-2 border-current px-3 py-1.5"
              style={accentStyle}
            >
              Checked against the sky
            </p>
          </div>
          {recentCommits.length > 0 ? (
            <div className="flex flex-col gap-3">
              <p className="label text-background/60">Recent revisions</p>
              <ul className="flex flex-col gap-1.5 font-mono text-xs">
                {recentCommits.map((commit) => (
                  <li className="flex gap-4" key={commit.hash}>
                    <span className="text-background/60 tabular-nums">
                      {commit.hash}
                    </span>
                    <span>{commit.subject}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);

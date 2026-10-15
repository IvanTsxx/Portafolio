import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { OpenFile } from "./file-desk";
import type { Ledger, LedgerEntry } from "./ledger";
import { COLUMNS_PER_MONTH, SPROCKET_ROW, TAPE_ROWS, holesOf } from "./tape";
import { TapeWindow } from "./tape-window";

const LEAD_REM = 2;

const months = (count: number) => `calc(var(--month) * ${count})`;

const percent = (fraction: number) => `${(fraction * 100).toFixed(4)}%`;

const Sprockets = ({
  className,
  columns,
}: {
  className: string;
  columns: number;
}) => (
  <g className={className}>
    {Array.from({ length: columns }, (_, column) => (
      <circle cx={column + 0.5} cy={SPROCKET_ROW + 0.5} key={column} r={0.16} />
    ))}
  </g>
);

const StretchHoles = ({ entry }: { entry: LedgerEntry }) => {
  const columns = entry.months * COLUMNS_PER_MONTH;
  const holes = holesOf(entry.company, columns);
  return (
    <svg
      aria-hidden
      className="exp-tape-strip block w-full"
      preserveAspectRatio="none"
      viewBox={`0 0 ${columns} ${TAPE_ROWS}`}
    >
      <rect className="fill-paper-deep" height={TAPE_ROWS} width={columns} />
      <rect
        className="exp-stretch-glow fill-ink"
        height={TAPE_ROWS}
        width={columns}
      />
      <Sprockets className="fill-graphite" columns={columns} />
      <g className="fill-ink">
        {holes.map((hole) => (
          <circle
            cx={hole.column + 0.5}
            cy={hole.row + 0.5}
            key={`${hole.column}-${hole.row}`}
            r={0.34}
          />
        ))}
      </g>
      <g className="fill-paper">
        {holes.map((hole) => (
          <circle
            className="exp-hole-lit"
            cx={hole.column + 0.5}
            cy={hole.row + 0.5}
            key={`${hole.column}-${hole.row}`}
            r={0.34}
            style={{ transitionDelay: `${hole.delay}ms` }}
          />
        ))}
      </g>
      <path
        className="stroke-rule-strong"
        d={`M0 0H${columns}M0 ${TAPE_ROWS}H${columns}M0 0V${TAPE_ROWS}`}
        fill="none"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const Stretch = ({ entry }: { entry: LedgerEntry }) => (
  <OpenFile
    className={cn(
      "exp-stretch absolute inset-0 flex cursor-pointer flex-col text-left",
      focusRingClassName
    )}
    file={entry.file}
    label={`${entry.spoken}. Open file.`}
  >
    <span className="label text-ink flex h-6 items-end gap-2 pb-1 whitespace-nowrap tabular-nums">
      <span className="text-mist">{entry.ordinal}</span>
      {entry.company}
    </span>
    <StretchHoles entry={entry} />
    <span className="label text-graphite flex flex-col gap-1 pt-2 whitespace-nowrap tabular-nums">
      <span>{entry.dates}</span>
      <span className="text-mist">{entry.role}</span>
    </span>
  </OpenFile>
);

export const PunchedTape = ({ ledger }: { ledger: Ledger }) => {
  const oldestFirst = ledger.entries.toReversed();
  const columns = ledger.scaleMonths * COLUMNS_PER_MONTH;
  return (
    <figure className="exp-tape-scope m-0 flex flex-col gap-3" data-build-block>
      <TapeWindow>
        <div
          className="exp-tape-track relative py-2"
          style={{
            paddingInline: `${LEAD_REM}rem`,
            width: `calc(${months(ledger.scaleMonths)} + ${LEAD_REM * 2}rem)`,
          }}
        >
          <div className="relative">
            <div aria-hidden className="relative h-5">
              {ledger.ruler.map((mark) => (
                <span
                  className={cn(
                    "label text-mist border-rule-strong absolute top-0 bottom-0 border-l pl-1",
                    mark.at === 1 &&
                      "-translate-x-full border-r border-l-0 pr-1 pl-0"
                  )}
                  key={mark.label}
                  style={{ left: percent(mark.at) }}
                >
                  {mark.label}
                </span>
              ))}
            </div>
            <div className="relative">
              <svg
                aria-hidden
                className="exp-tape-strip mt-6 block w-full"
                preserveAspectRatio="none"
                viewBox={`0 0 ${columns} ${TAPE_ROWS}`}
              >
                <rect
                  className="fill-paper-deep stroke-rule-strong"
                  height={TAPE_ROWS}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  width={columns}
                />
                <Sprockets className="fill-graphite" columns={columns} />
              </svg>
              <div className="h-12" />
              {oldestFirst.map((entry) => (
                <div
                  className="absolute top-0 bottom-0"
                  key={entry.id}
                  style={{
                    left: percent(entry.bar.start),
                    width: percent(entry.bar.span),
                  }}
                >
                  <Stretch entry={entry} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </TapeWindow>
      <figcaption className="label text-mist flex justify-between gap-4">
        <span>Tape · 1 month = 4 columns</span>
        <span>Scroll to feed · hover a stretch</span>
      </figcaption>
    </figure>
  );
};

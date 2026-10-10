import type { CSSProperties } from "react";

import { DocumentSection } from "@/components/site/document-section";
import type {
  ActivityKind,
  ActivityOverview as ActivityOverviewData,
} from "@/lib/github/model";
import { cn } from "@/lib/utils";

import { inkPatterns, profileLink } from "./ink";
import { Module } from "./module";

const CENTER = 100;
const REACH = 70;
const LISTED_REPOSITORIES = 3;
const TICKS = 11;
const LABEL_FONT_SIZE = 7;
const VALUE_FONT_SIZE = 9;

interface Axis {
  x: number;
  y: number;
  label: { x: number; y: number; anchor: "start" | "middle" | "end" };
  fill: { className?: string; style?: CSSProperties };
}

const shareLabels = [
  { jp: "査読", key: "code-review", label: "Code review" },
  { jp: "課題", key: "issues", label: "Issues" },
  { jp: "統合要求", key: "pull-requests", label: "Pull requests" },
  { jp: "変更", key: "commits", label: "Commits" },
] as const satisfies readonly {
  key: ActivityKind;
  label: string;
  jp: string;
}[];

type ActivityShare = (typeof shareLabels)[number] & { percent: number };

const sharesOf = (totals: Record<ActivityKind, number>): ActivityShare[] => {
  const sum = Object.values(totals).reduce((total, count) => total + count, 0);
  return shareLabels.map((share) => ({
    ...share,
    percent: sum === 0 ? 0 : Math.round((totals[share.key] / sum) * 100),
  }));
};

const axes: Record<ActivityKind, Axis> = {
  "code-review": {
    fill: { className: "bg-graphite/30" },
    label: { anchor: "middle", x: 100, y: 12 },
    x: 0,
    y: -1,
  },
  commits: {
    fill: { className: "bg-ink" },
    label: { anchor: "start", x: 0, y: 84 },
    x: -1,
    y: 0,
  },
  issues: {
    fill: { className: "bg-graphite/55" },
    label: { anchor: "end", x: 200, y: 84 },
    x: 1,
    y: 0,
  },
  "pull-requests": {
    fill: { style: inkPatterns.diagonal },
    label: { anchor: "middle", x: 100, y: 182 },
    x: 0,
    y: 1,
  },
};

const pointFor = (share: ActivityShare) => {
  const axis = axes[share.key];
  const distance = (share.percent / 100) * REACH;
  return { x: CENTER + axis.x * distance, y: CENTER + axis.y * distance };
};

const percentLabel = (percent: number) =>
  `${String(percent).padStart(2, "0")}%`;

const DistributionChart = ({ shares }: { shares: ActivityShare[] }) => {
  const points = shares.map(pointFor);
  return (
    <svg
      aria-label={`Activity distribution: ${shares.map((share) => `${share.label} ${share.percent} percent`).join(", ")}`}
      className="mx-auto w-full max-w-80"
      viewBox="0 0 200 200"
    >
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <rect
          className="stroke-graphite/30"
          fill="none"
          height={REACH * ring * 2}
          key={ring}
          strokeDasharray="1 3"
          vectorEffect="non-scaling-stroke"
          width={REACH * ring * 2}
          x={CENTER - REACH * ring}
          y={CENTER - REACH * ring}
        />
      ))}
      <line
        className="stroke-ink"
        vectorEffect="non-scaling-stroke"
        x1={CENTER - REACH}
        x2={CENTER + REACH}
        y1={CENTER}
        y2={CENTER}
      />
      <line
        className="stroke-ink"
        vectorEffect="non-scaling-stroke"
        x1={CENTER}
        x2={CENTER}
        y1={CENTER - REACH}
        y2={CENTER + REACH}
      />
      {Array.from({ length: TICKS }, (_, index) => {
        const offset = (index - 5) * (REACH / 5);
        return (
          <g className="stroke-ink" key={offset}>
            <line
              vectorEffect="non-scaling-stroke"
              x1={CENTER + offset}
              x2={CENTER + offset}
              y1={CENTER - 2}
              y2={CENTER + 2}
            />
            <line
              vectorEffect="non-scaling-stroke"
              x1={CENTER - 2}
              x2={CENTER + 2}
              y1={CENTER + offset}
              y2={CENTER + offset}
            />
          </g>
        );
      })}
      <polygon
        className="fill-ink/10 stroke-ink"
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        strokeWidth={1.25}
        vectorEffect="non-scaling-stroke"
      />
      {points.map((point, index) => (
        <rect
          className="fill-ink"
          height={5}
          key={shares[index]?.key}
          width={5}
          x={point.x - 2.5}
          y={point.y - 2.5}
        />
      ))}
      {shares.map((share) => {
        const { label } = axes[share.key];
        return (
          <text
            className="fill-ink font-mono uppercase"
            fontSize={LABEL_FONT_SIZE}
            key={share.key}
            textAnchor={label.anchor}
            x={label.x}
            y={label.y}
          >
            <tspan className="fill-mist" x={label.x}>
              {share.label}
            </tspan>
            <tspan dy={9} fontSize={VALUE_FONT_SIZE} x={label.x}>
              {percentLabel(share.percent)}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
};

export const ActivityOverview = ({
  activity,
}: {
  activity: ActivityOverviewData;
}) => {
  const shares = sharesOf(activity.totals);
  const recorded = shares.filter((share) => share.percent > 0);

  return (
    <DocumentSection
      id="overview"
      index="GH-07"
      waypoint={{ action: "inspect", role: "inspector", side: "left" }}
      jp="活動概要"
      label="Activity overview"
    >
      <div className="border-rule relative grid grid-cols-1 border-t border-l md:grid-cols-2">
        <Module id="A-01" jp="分布" title="Distribution">
          <DistributionChart shares={shares} />
        </Module>

        <Module id="A-02" jp="比率" title="Ratio">
          <div className="flex flex-col gap-6">
            <div aria-hidden className="border-ink flex h-4 w-full border">
              {recorded.map((share) => (
                <span
                  className={cn(
                    "border-ink h-full border-r last:border-r-0",
                    axes[share.key].fill.className
                  )}
                  key={share.key}
                  style={{
                    ...axes[share.key].fill.style,
                    width: `${share.percent}%`,
                  }}
                />
              ))}
            </div>
            <table className="label w-full border-collapse tabular-nums">
              <caption className="sr-only">
                Share of contributions by type
              </caption>
              <tbody>
                {shares.toReversed().map((share) => (
                  <tr className="border-rule border-t" key={share.key}>
                    <th
                      className="text-ink py-2 text-left font-normal"
                      scope="row"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className={cn(
                            "border-ink size-2.5 border",
                            axes[share.key].fill.className
                          )}
                          style={axes[share.key].fill.style}
                        />
                        {share.label}
                        <span className="jp text-mist">{share.jp}</span>
                      </span>
                    </th>
                    <td className="text-ink py-2 text-right">
                      {percentLabel(share.percent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="label flex flex-col gap-2">
              <dt className="text-mist">
                Contributed to <span className="jp">貢献先</span>
              </dt>
              {activity.repositories.length === 0 && (
                <dd className="text-mist">No public repositories / 公開なし</dd>
              )}
              {activity.repositories
                .slice(0, LISTED_REPOSITORIES)
                .map((repository) => (
                  <dd
                    className="text-ink break-all normal-case"
                    key={repository}
                  >
                    <a
                      className={profileLink}
                      href={`https://github.com/${repository}`}
                      rel="noopener"
                      target="_blank"
                    >
                      → {repository}
                    </a>
                  </dd>
                ))}
              {activity.repositories.length > LISTED_REPOSITORIES && (
                <dd className="text-mist tabular-nums">
                  + {activity.repositories.length - LISTED_REPOSITORIES} other
                  repositories
                </dd>
              )}
            </dl>
          </div>
        </Module>
      </div>
    </DocumentSection>
  );
};

import { AgentSpot } from "@/components/scene/agent-spot";
import type { ContributionCalendar } from "@/lib/github/model";

import { profileAgentSpots } from "./agent-spots";
import { contributionStats, formatShortDay } from "./contributions";
import type { ContributionStreak } from "./contributions";
import { Module } from "./module";

const streakRange = (streak: ContributionStreak) =>
  streak.start && streak.end
    ? `${formatShortDay(streak.start)} → ${formatShortDay(streak.end)}`
    : "No active run";

const pad = (value: number) => String(value).padStart(2, "0");

const Readout = ({
  value,
  unit,
  note,
}: {
  value: string;
  unit: string;
  note: string;
}) => (
  <div className="flex flex-col gap-2">
    <p className="text-ink font-mono text-4xl font-light tracking-tight tabular-nums">
      {value}
      <span className="text-graphite ml-1 text-xs tracking-widest">{unit}</span>
    </p>
    <p className="label text-mist tabular-nums">{note}</p>
  </div>
);

export const ContributionStatsReadout = ({
  calendar,
}: {
  calendar: ContributionCalendar;
}) => {
  const stats = contributionStats(calendar);
  return (
    <div className="border-rule relative grid grid-cols-1 border-t border-l sm:grid-cols-2 xl:grid-cols-4">
      <Module id="S-01" jp="連続" title="Current streak">
        <Readout
          note={streakRange(stats.currentStreak)}
          unit="days"
          value={pad(stats.currentStreak.length)}
        />
      </Module>
      <Module id="S-02" jp="最長" title="Longest streak">
        <Readout
          note={streakRange(stats.longestStreak)}
          unit="days"
          value={pad(stats.longestStreak.length)}
        />
      </Module>
      <Module id="S-03" jp="最多日" title="Busiest day">
        <Readout
          note={
            stats.busiestDay
              ? formatShortDay(stats.busiestDay.date)
              : "No activity"
          }
          unit="contrib"
          value={pad(stats.busiestDay?.count ?? 0)}
        />
      </Module>
      <Module id="S-04" jp="稼働日" title="Active days">
        <Readout
          note={`Peak ${stats.busiestWeekday.label} · ${stats.dailyAverage.toFixed(2)} / day`}
          unit="days"
          value={pad(stats.activeDays)}
        />
      </Module>
      <AgentSpot {...profileAgentSpots.contributionStats} />
    </div>
  );
};

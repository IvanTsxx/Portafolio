import type { Icon } from "@phosphor-icons/react";
import {
  ChatCircleIcon,
  EyeIcon,
  GitCommitIcon,
  GitDiffIcon,
  GitPullRequestIcon,
  LockIcon,
  RecordIcon,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

import { AgentSpot } from "@/components/scene/agent-spot";
import type {
  RepositoryCount,
  TimelineEventOf,
  TimelineKind,
  TimelineMonth,
} from "@/lib/github/model";
import { cn } from "@/lib/utils";

import { profileAgentSpots } from "./agent-spots";
import { formatMonth, formatShortDay } from "./contributions";
import { inkPatterns, profileLink } from "./ink";
import { TickMark } from "./module";
import { SectionFrame } from "./section-frame";
import { TimelineDisclosure } from "./timeline-disclosure";

interface KindDefinition<Kind extends TimelineKind> {
  label: string;
  jp: string;
  icon: Icon;
  summary: (event: TimelineEventOf<Kind>) => string;
  render: (event: TimelineEventOf<Kind>) => ReactNode;
}

const DIFF_CELLS = 5;
const INITIAL_MONTHS = 1;

const countFormat = new Intl.NumberFormat("en-US");

const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${countFormat.format(count)} ${count === 1 ? singular : pluralForm}`;

const repositoryCount = (count: number) =>
  plural(count, "repository", "repositories");

const RepositoryRatioTable = ({
  caption,
  rows,
  total,
  unit,
}: {
  caption: string;
  rows: readonly RepositoryCount[];
  total: number;
  unit: string;
}) => (
  <table className="label w-full border-collapse tabular-nums">
    <caption className="sr-only">{caption}</caption>
    <tbody>
      {rows.map((row) => (
        <tr className="border-rule border-t" key={row.repository}>
          <th
            className="text-ink py-2 pr-4 text-left font-normal break-all normal-case"
            scope="row"
          >
            <a
              className={profileLink}
              href={`https://github.com/${row.repository}`}
              rel="noopener"
              target="_blank"
            >
              {row.repository}
            </a>
          </th>
          <td className="text-ink py-2 text-right whitespace-nowrap">
            {String(row.count).padStart(2, "0")}{" "}
            <span className="text-mist">{unit}</span>
          </td>
          <td aria-hidden className="hidden w-2/5 py-2 pl-6 sm:table-cell">
            <span className="bg-graphite/10 block h-1.5">
              <span
                className="bg-ink block h-full origin-left"
                style={{ transform: `scaleX(${row.count / total})` }}
              />
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Stamp = ({ en, jp }: { en: string; jp: string }) => (
  <span className="border-graphite bg-graphite text-paper inline-flex min-h-11 flex-col items-center justify-center border-2 px-3 py-1 text-center">
    <span className="jp text-sm leading-tight">{jp}</span>
    <span className="label leading-tight">{en}</span>
  </span>
);

const DiffBar = ({
  additions,
  deletions,
}: {
  additions: number;
  deletions: number;
}) => {
  const changed = additions + deletions;
  const added =
    changed === 0 ? 0 : Math.round((additions / changed) * DIFF_CELLS);
  const removed = changed === 0 ? 0 : DIFF_CELLS - added;
  return (
    <span aria-hidden className="flex gap-0.5">
      {Array.from({ length: DIFF_CELLS }, (_, index) => (
        <span
          className={cn(
            "border-ink size-2.5 border",
            index < added && "bg-ink"
          )}
          key={index}
          style={
            index >= added && index < added + removed
              ? inkPatterns["diagonal-fine"]
              : undefined
          }
        />
      ))}
    </span>
  );
};

type TimelineKindTable = { [Kind in TimelineKind]: KindDefinition<Kind> };

const timelineKinds: TimelineKindTable = {
  commits: {
    icon: GitCommitIcon,
    jp: "変更記録",
    label: "Commits",
    render: (event) => (
      <RepositoryRatioTable
        caption="Commits per repository"
        rows={event.repositories}
        total={event.total}
        unit="commits"
      />
    ),
    summary: (event) =>
      `Created ${plural(event.total, "commit")} in ${repositoryCount(event.repositories.length)}`,
  },
  issues: {
    icon: RecordIcon,
    jp: "課題",
    label: "Issues",
    render: (event) => (
      <RepositoryRatioTable
        caption="Issues opened per repository"
        rows={event.repositories}
        total={event.total}
        unit="issues"
      />
    ),
    summary: (event) =>
      `Opened ${plural(event.total, "issue")} in ${repositoryCount(event.repositories.length)}`,
  },
  "opened-prs": {
    icon: GitPullRequestIcon,
    jp: "提出",
    label: "Opened",
    render: (event) => (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <RepositoryRatioTable
            caption="Pull requests opened per repository"
            rows={event.repositories}
            total={event.total}
            unit="PRs"
          />
        </div>
        <span className="text-ink flex items-center gap-3 font-mono text-3xl font-light tracking-tight tabular-nums">
          {String(event.merged).padStart(2, "0")}
          <Stamp en="Merged" jp="統合済" />
        </span>
      </div>
    ),
    summary: (event) =>
      `Opened ${plural(event.total, "pull request")} in ${repositoryCount(event.repositories.length)}`,
  },
  private: {
    icon: LockIcon,
    jp: "非公開",
    label: "Private",
    render: (event) => (
      <div className="border-rule-strong hatch flex flex-wrap items-center justify-between gap-4 border border-dashed p-4">
        <p className="label text-graphite max-w-sm">
          Repository names and details are withheld{" "}
          <span className="jp">詳細非開示</span>
        </p>
        <span className="text-ink flex items-center gap-3 font-mono text-3xl font-light tracking-tight tabular-nums">
          {countFormat.format(event.total)}
          <Stamp en="Redacted" jp="秘匿" />
        </span>
      </div>
    ),
    summary: (event) =>
      `${plural(event.total, "contribution")} in private repositories`,
  },
  "pull-request": {
    icon: GitDiffIcon,
    jp: "統合要求",
    label: "Pull request",
    render: (event) => (
      <article className="border-rule-strong bg-paper relative border p-4">
        <TickMark />
        <header className="label border-rule text-mist flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
          <span className="break-all normal-case">{event.repository}</span>
          <time className="tabular-nums" dateTime={event.date}>
            {formatShortDay(event.date)}
          </time>
        </header>
        <h5 className="text-ink mt-3 text-base leading-snug font-medium text-balance">
          <a
            className={profileLink}
            href={event.url}
            rel="noopener"
            target="_blank"
          >
            {event.title}
          </a>
        </h5>
        {event.excerpt && (
          <p className="text-graphite mt-2 text-sm leading-relaxed text-pretty">
            {event.excerpt}
          </p>
        )}
        <footer className="label text-ink mt-4 flex flex-wrap items-center justify-between gap-3 tabular-nums">
          <span className="flex items-center gap-3">
            <span
              aria-label={`${countFormat.format(event.additions)} lines added, ${countFormat.format(event.deletions)} removed`}
            >
              +{countFormat.format(event.additions)}{" "}
              <span className="text-mist">
                −{countFormat.format(event.deletions)}
              </span>
            </span>
            <DiffBar additions={event.additions} deletions={event.deletions} />
          </span>
          <span className="flex items-center gap-1.5">
            <ChatCircleIcon aria-hidden className="size-3" />
            {plural(event.comments, "comment")}
          </span>
        </footer>
      </article>
    ),
    summary: (event) => `Created a pull request in ${event.repository}`,
  },
  reviews: {
    icon: EyeIcon,
    jp: "査読",
    label: "Reviews",
    render: (event) => (
      <RepositoryRatioTable
        caption="Pull requests reviewed per repository"
        rows={event.repositories}
        total={event.total}
        unit="reviewed"
      />
    ),
    summary: (event) =>
      `Reviewed ${plural(event.total, "pull request")} in ${repositoryCount(event.repositories.length)}`,
  },
};

const TimelineEntry = <Kind extends TimelineKind>({
  event,
}: {
  event: TimelineEventOf<Kind>;
}) => {
  const definition: KindDefinition<Kind> = timelineKinds[event.kind];
  const KindIcon = definition.icon;
  return (
    <li className="relative flex flex-col gap-3 pl-8">
      <span
        aria-hidden
        className="border-ink bg-paper absolute top-1 left-0 size-3 border"
      />
      <p className="label flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-mist tabular-nums">{event.id}</span>
        <span className="text-ink flex items-center gap-1.5">
          <KindIcon aria-hidden className="size-3" />
          {definition.label}
        </span>
        <span className="jp text-mist">{definition.jp}</span>
      </p>
      <h4 className="text-ink text-base leading-snug text-balance">
        {definition.summary(event)}
      </h4>
      {definition.render(event)}
    </li>
  );
};

const TimelineMonthGroup = ({ month }: { month: TimelineMonth }) => {
  const title = formatMonth(month.year, month.month);
  return (
    <li className="flex flex-col gap-6">
      <h3 className="label text-ink flex items-center gap-3">
        <span>{title.en}</span>
        <span aria-hidden className="bg-graphite/40 h-px flex-1" />
        <span className="jp text-mist">{title.jp}</span>
      </h3>
      <ol className="relative flex flex-col gap-8">
        <span
          aria-hidden
          className="bg-graphite/40 absolute top-0 bottom-0 left-1.5 w-px"
        />
        {month.events.map((event) => (
          <TimelineEntry event={event} key={event.id} />
        ))}
      </ol>
    </li>
  );
};

export const ActivityTimeline = ({
  months,
}: {
  months: readonly TimelineMonth[];
}) => (
  <SectionFrame
    className="relative"
    id="timeline"
    index="GH-07"
    jp="活動記録"
    label="Contribution activity"
  >
    <AgentSpot {...profileAgentSpots.timeline} />
    {months.length === 0 ? (
      <p className="label text-mist">
        No recorded activity <span className="jp">記録なし</span>
      </p>
    ) : (
      <TimelineDisclosure
        entries={months.map((month) => (
          <TimelineMonthGroup
            key={`${month.year}-${month.month}`}
            month={month}
          />
        ))}
        id="timeline-months"
        initialCount={INITIAL_MONTHS}
      />
    )}
  </SectionFrame>
);

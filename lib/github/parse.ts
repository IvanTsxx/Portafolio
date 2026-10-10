import type {
  ActivityOverview,
  ContributionCalendar,
  ContributionDay,
  ContributionRange,
  ContributionWeek,
  GithubIdentity,
  PinnedRepository,
  RepositoryCount,
  TimelineEvent,
  TimelineEventOf,
  TimelineMonth,
} from "./model";
import {
  isRedacted,
  keepPublic,
  publicAffiliation,
  publicEmail,
  publicOrganizations,
} from "./privacy";
import type {
  RawCalendar,
  RawCollection,
  RawMonth,
  RawPinned,
  RawRepositoryCount,
  RawRestUser,
  RawUser,
} from "./raw";

export interface MonthKey {
  year: number;
  month: number;
}

const EXCERPT_LENGTH = 220;
const DAYS_PER_WEEK = 7;

const parseWeek = (week: RawCalendar["weeks"][number]): ContributionWeek => {
  const slots: (ContributionDay | null)[] = Array.from(
    { length: DAYS_PER_WEEK },
    () => null
  );
  for (const day of week.contributionDays) {
    slots[day.weekday] = {
      count: day.contributionCount,
      date: day.date,
      level: day.contributionLevel,
    };
  }
  return slots;
};

export const parseCalendar = (
  calendar: RawCalendar,
  year: number,
  range: ContributionRange
): ContributionCalendar => ({
  range,
  total: calendar.totalContributions,
  weeks: calendar.weeks.map(parseWeek),
  year,
});

export const parseRepositoryCounts = (
  rows: readonly RawRepositoryCount[]
): RepositoryCount[] =>
  keepPublic(
    rows.map((row) => ({
      count: row.contributions.totalCount,
      repository: row.repository.nameWithOwner,
    })),
    (row) => [row.repository]
  )
    .filter((row) => row.count > 0)
    .toSorted((a, b) => b.count - a.count);

const sumCounts = (rows: readonly RepositoryCount[]) => {
  let sum = 0;
  for (const row of rows) {
    sum += row.count;
  }
  return sum;
};

const publicText = (value: string | null) => (isRedacted(value) ? null : value);

export const parseIdentity = (
  user: RawUser,
  rest: RawRestUser,
  allowedEmail: string
): GithubIdentity => ({
  bio: publicText(user.bio),
  company: publicAffiliation(user.company),
  createdAt: rest.created_at,
  email: publicEmail(rest.email, allowedEmail),
  followers: user.followers.totalCount,
  following: user.following.totalCount,
  location: publicText(user.location),
  login: user.login,
  name: user.name,
  organizations: publicOrganizations(
    user.organizations.nodes.map((node) => node.login)
  ),
  repositories: user.repositories.totalCount,
  starred: user.starredRepositories.totalCount,
  twitterUsername: publicText(user.twitterUsername),
  websiteUrl: publicText(user.websiteUrl),
});

const visibilityOf = (node: RawPinned) => {
  if (node.isPrivate) {
    return "private";
  }
  return node.isTemplate ? "public-template" : "public";
};

export const parsePinned = (nodes: readonly RawPinned[]): PinnedRepository[] =>
  keepPublic(
    nodes.map((node): PinnedRepository => ({
      description: node.description,
      language: node.primaryLanguage?.name ?? null,
      name: node.name,
      nameWithOwner: node.nameWithOwner,
      stars: node.stargazerCount,
      visibility: visibilityOf(node),
    })),
    (repository) => [repository.nameWithOwner, repository.description]
  );

export const parseActivity = (collection: RawCollection): ActivityOverview => {
  const byRepository = new Map<string, number>();
  const groups = [
    collection.commitContributionsByRepository,
    collection.pullRequestContributionsByRepository,
    collection.pullRequestReviewContributionsByRepository,
    collection.issueContributionsByRepository,
  ];
  for (const group of groups) {
    for (const row of parseRepositoryCounts(group)) {
      byRepository.set(
        row.repository,
        (byRepository.get(row.repository) ?? 0) + row.count
      );
    }
  }
  return {
    repositories: [...byRepository.entries()]
      .toSorted((a, b) => b[1] - a[1])
      .map(([repository]) => repository),
    totals: {
      "code-review": collection.totalPullRequestReviewContributions,
      commits: collection.totalCommitContributions,
      issues: collection.totalIssueContributions,
      "pull-requests": collection.totalPullRequestContributions,
    },
  };
};

const excerptOf = (bodyText: string) => {
  const collapsed = bodyText.replaceAll(/\s+/gu, " ").trim();
  if (collapsed === "") {
    return null;
  }
  if (collapsed.length <= EXCERPT_LENGTH) {
    return collapsed;
  }
  const cut = collapsed.slice(0, EXCERPT_LENGTH);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), EXCERPT_LENGTH / 2)).trimEnd()}…`;
};

type PullRequestHighlight = Omit<
  TimelineEventOf<"pull-request">,
  "kind" | "id"
>;

interface PullRequestRecord {
  merged: boolean;
  highlight: PullRequestHighlight;
}

type RawPullRequestEntry =
  RawMonth["pullRequestContributionsByRepository"][number];

const parsePullRequestEntry = (entry: RawPullRequestEntry) => {
  const repository = entry.repository.nameWithOwner;
  const pullRequests: PullRequestRecord[] = [];
  for (const { pullRequest } of entry.contributions.nodes) {
    if (pullRequest) {
      pullRequests.push({
        highlight: {
          additions: pullRequest.additions,
          comments: pullRequest.comments.totalCount,
          date: pullRequest.createdAt.slice(0, 10),
          deletions: pullRequest.deletions,
          excerpt: excerptOf(pullRequest.bodyText),
          repository,
          title: pullRequest.title,
          url: pullRequest.url,
        },
        merged: pullRequest.merged,
      });
    }
  }
  return {
    count: entry.contributions.totalCount,
    pullRequests: keepPublic(pullRequests, ({ highlight }) => [
      highlight.title,
      highlight.excerpt,
      highlight.url,
    ]),
    repository,
  };
};

const largestOf = (pullRequests: readonly PullRequestRecord[]) => {
  let best: PullRequestRecord | null = null;
  for (const pullRequest of pullRequests) {
    if (pullRequest.highlight.additions > (best?.highlight.additions ?? -1)) {
      best = pullRequest;
    }
  }
  return best;
};

export const monthAlias = ({ year, month }: MonthKey) =>
  `m${year}_${String(month).padStart(2, "0")}`;

export const parseTimelineMonth = (
  key: MonthKey,
  month: RawMonth
): TimelineMonth => {
  const commits = parseRepositoryCounts(month.commitContributionsByRepository);
  const reviews = parseRepositoryCounts(
    month.pullRequestReviewContributionsByRepository
  );
  const issues = parseRepositoryCounts(month.issueContributionsByRepository);
  const pullRequestRepositories = keepPublic(
    month.pullRequestContributionsByRepository.map(parsePullRequestEntry),
    (entry) => [entry.repository]
  );
  const pullRequests = pullRequestRepositories.flatMap(
    (entry) => entry.pullRequests
  );
  const largest = largestOf(pullRequests);
  const openedRows: RepositoryCount[] = [];
  for (const entry of pullRequestRepositories) {
    if (entry.count > 0) {
      openedRows.push({ count: entry.count, repository: entry.repository });
    }
  }
  openedRows.sort((a, b) => b.count - a.count);

  const events: TimelineEvent[] = [];
  const nextId = () => `E-${String(events.length + 1).padStart(2, "0")}`;
  if (commits.length > 0) {
    events.push({
      id: nextId(),
      kind: "commits",
      repositories: commits,
      total: sumCounts(commits),
    });
  }
  if (largest) {
    events.push({ id: nextId(), kind: "pull-request", ...largest.highlight });
  }
  if (openedRows.length > 0) {
    events.push({
      id: nextId(),
      kind: "opened-prs",
      merged: pullRequests.filter((pullRequest) => pullRequest.merged).length,
      repositories: openedRows,
      total: sumCounts(openedRows),
    });
  }
  if (reviews.length > 0) {
    events.push({
      id: nextId(),
      kind: "reviews",
      repositories: reviews,
      total: sumCounts(reviews),
    });
  }
  if (issues.length > 0) {
    events.push({
      id: nextId(),
      kind: "issues",
      repositories: issues,
      total: sumCounts(issues),
    });
  }
  if (month.restrictedContributionsCount > 0) {
    events.push({
      id: nextId(),
      kind: "private",
      total: month.restrictedContributionsCount,
    });
  }

  return { ...key, events };
};

export const latestActiveMonths = (
  calendars: readonly ContributionCalendar[],
  count: number
): MonthKey[] => {
  const activeMonths = new Set<string>();
  for (const calendar of calendars) {
    for (const week of calendar.weeks) {
      for (const day of week) {
        if (day && day.count > 0) {
          activeMonths.add(day.date.slice(0, 7));
        }
      }
    }
  }
  return [...activeMonths]
    .toSorted()
    .toReversed()
    .slice(0, count)
    .map((month) => ({
      month: Number(month.slice(5, 7)),
      year: Number(month.slice(0, 4)),
    }));
};

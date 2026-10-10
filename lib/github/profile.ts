import { siteConfig } from "@/lib/site/config";

import { githubGraphql, githubRest } from "./api";
import { githubProfileSchema } from "./model";
import type { GithubProfile, LoadedGithubProfile } from "./model";
import {
  latestActiveMonths,
  monthAlias,
  parseActivity,
  parseCalendar,
  parseIdentity,
  parsePinned,
  parseTimelineMonth,
} from "./parse";
import type { MonthKey } from "./parse";
import { assertPublicProfile } from "./privacy";
import {
  rawMonthsSchema,
  rawRestUserSchema,
  rawUserSchema,
  rawYearCalendarsSchema,
} from "./raw";
import snapshot from "./snapshot.json";

export const GITHUB_LOGIN = siteConfig.github;

const TIMELINE_MONTHS = 3;

const calendarFields =
  "totalContributions weeks { contributionDays { date weekday contributionCount contributionLevel } }";

const repositoryCountFields =
  "repository { nameWithOwner } contributions { totalCount }";

const profileQuery = `query($login: String!) {
  user(login: $login) {
    login name bio company location websiteUrl twitterUsername
    followers { totalCount }
    following { totalCount }
    repositories(ownerAffiliations: OWNER) { totalCount }
    starredRepositories { totalCount }
    organizations(first: 20) { nodes { login } }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository { name nameWithOwner description isTemplate isPrivate stargazerCount primaryLanguage { name } } }
    }
    contributionsCollection {
      contributionYears
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      commitContributionsByRepository(maxRepositories: 25) { ${repositoryCountFields} }
      pullRequestContributionsByRepository(maxRepositories: 25) { ${repositoryCountFields} }
      pullRequestReviewContributionsByRepository(maxRepositories: 25) { ${repositoryCountFields} }
      issueContributionsByRepository(maxRepositories: 25) { ${repositoryCountFields} }
      contributionCalendar { ${calendarFields} }
    }
  }
}`;

const yearAlias = (year: number) => `y${year}`;

const yearCalendarsQuery = (years: readonly number[]) => {
  const fields = years.map(
    (year) =>
      `${yearAlias(year)}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") { contributionCalendar { ${calendarFields} } }`
  );
  return `query($login: String!) { user(login: $login) { ${fields.join("\n")} } }`;
};

const monthWindow = ({ year, month }: MonthKey) => {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return {
    from: `${prefix}-01T00:00:00Z`,
    to: `${prefix}-${String(lastDay).padStart(2, "0")}T23:59:59Z`,
  };
};

const monthCollectionsQuery = (months: readonly MonthKey[]) => {
  const fields = months.map((key) => {
    const { from, to } = monthWindow(key);
    return `${monthAlias(key)}: contributionsCollection(from: "${from}", to: "${to}") {
      restrictedContributionsCount
      commitContributionsByRepository(maxRepositories: 25) { ${repositoryCountFields} }
      pullRequestContributionsByRepository(maxRepositories: 25) {
        repository { nameWithOwner }
        contributions(first: 100) {
          totalCount
          nodes { pullRequest { title url createdAt additions deletions merged bodyText comments { totalCount } } }
        }
      }
      pullRequestReviewContributionsByRepository(maxRepositories: 25) { ${repositoryCountFields} }
      issueContributionsByRepository(maxRepositories: 25) { ${repositoryCountFields} }
    }`;
  });
  return `query($login: String!) { user(login: $login) { ${fields.join("\n")} } }`;
};

const fetchPastCalendars = async (token: string, years: readonly number[]) => {
  if (years.length === 0) {
    return [];
  }
  const user = await githubGraphql(
    token,
    yearCalendarsQuery(years),
    { login: GITHUB_LOGIN },
    rawYearCalendarsSchema
  );
  return years.flatMap((year) => {
    const entry = user[yearAlias(year)];
    return entry
      ? [parseCalendar(entry.contributionCalendar, year, "calendar-year")]
      : [];
  });
};

const fetchTimeline = async (token: string, months: readonly MonthKey[]) => {
  if (months.length === 0) {
    return [];
  }
  const user = await githubGraphql(
    token,
    monthCollectionsQuery(months),
    { login: GITHUB_LOGIN },
    rawMonthsSchema
  );
  return months.flatMap((key) => {
    const month = user[monthAlias(key)];
    return month ? [parseTimelineMonth(key, month)] : [];
  });
};

export const fetchGithubProfile = async (
  token: string,
  fetchedAt: Date
): Promise<GithubProfile> => {
  const [user, rest] = await Promise.all([
    githubGraphql(token, profileQuery, { login: GITHUB_LOGIN }, rawUserSchema),
    githubRest(token, `/users/${GITHUB_LOGIN}`, rawRestUserSchema),
  ]);
  const collection = user.contributionsCollection;
  const currentYear = fetchedAt.getUTCFullYear();
  const pastYears = collection.contributionYears
    .filter((year) => year < currentYear)
    .toSorted((a, b) => b - a);

  const calendars: GithubProfile["calendars"] = [
    parseCalendar(collection.contributionCalendar, currentYear, "last-year"),
    ...(await fetchPastCalendars(token, pastYears)),
  ];
  const timeline = await fetchTimeline(
    token,
    latestActiveMonths(calendars, TIMELINE_MONTHS)
  );

  return assertPublicProfile({
    activity: parseActivity(collection),
    calendars,
    fetchedAt: fetchedAt.toISOString(),
    identity: parseIdentity(user, rest, siteConfig.email),
    pinned: parsePinned(user.pinnedItems.nodes),
    timeline,
  });
};

export const snapshotProfile = (): GithubProfile =>
  assertPublicProfile(githubProfileSchema.parse(snapshot));

export const loadGithubProfile = async (): Promise<LoadedGithubProfile> => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { profile: snapshotProfile(), source: "snapshot" };
  }
  try {
    return {
      profile: await fetchGithubProfile(token, new Date()),
      source: "live",
    };
  } catch (error) {
    console.error("GitHub profile unavailable, using snapshot", error);
    return { profile: snapshotProfile(), source: "snapshot" };
  }
};

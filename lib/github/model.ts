import { z } from "zod";

export const contributionLevels = [0, 1, 2, 3, 4] as const;

export const contributionLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export type ContributionLevel = z.infer<typeof contributionLevelSchema>;

const contributionDaySchema = z.object({
  count: z.number(),
  date: z.string(),
  level: contributionLevelSchema,
});

export type ContributionDay = z.infer<typeof contributionDaySchema>;

const contributionWeekSchema = z.array(contributionDaySchema.nullable());

export type ContributionWeek = z.infer<typeof contributionWeekSchema>;

const contributionCalendarSchema = z.object({
  range: z.enum(["last-year", "calendar-year"]),
  total: z.number(),
  weeks: z.array(contributionWeekSchema),
  year: z.number(),
});

export type ContributionCalendar = z.infer<typeof contributionCalendarSchema>;

export type ContributionRange = ContributionCalendar["range"];

const githubIdentitySchema = z.object({
  avatarUrl: z.url().nullable(),
  bio: z.string().nullable(),
  company: z.string().nullable(),
  createdAt: z.string(),
  email: z.string().nullable(),
  followers: z.number(),
  following: z.number(),
  location: z.string().nullable(),
  login: z.string(),
  name: z.string().nullable(),
  organizations: z.array(z.string()),
  repositories: z.number(),
  starred: z.number(),
  twitterUsername: z.string().nullable(),
  websiteUrl: z.string().nullable(),
});

export type GithubIdentity = z.infer<typeof githubIdentitySchema>;

const repositoryVisibilitySchema = z.enum([
  "public",
  "public-template",
  "private",
]);

export type RepositoryVisibility = z.infer<typeof repositoryVisibilitySchema>;

const pinnedRepositorySchema = z.object({
  description: z.string().nullable(),
  language: z.string().nullable(),
  name: z.string(),
  nameWithOwner: z.string(),
  stars: z.number(),
  visibility: repositoryVisibilitySchema,
});

export type PinnedRepository = z.infer<typeof pinnedRepositorySchema>;

export const activityKinds = [
  "commits",
  "pull-requests",
  "code-review",
  "issues",
] as const;

export type ActivityKind = (typeof activityKinds)[number];

const activityOverviewSchema = z.object({
  repositories: z.array(z.string()),
  totals: z.object({
    "code-review": z.number(),
    commits: z.number(),
    issues: z.number(),
    "pull-requests": z.number(),
  }),
});

export type ActivityOverview = z.infer<typeof activityOverviewSchema>;

const repositoryCountSchema = z.object({
  count: z.number(),
  repository: z.string(),
});

export type RepositoryCount = z.infer<typeof repositoryCountSchema>;

const repositoryTotalFields = {
  repositories: z.array(repositoryCountSchema),
  total: z.number(),
};

const timelineEventSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string(),
    kind: z.literal("commits"),
    ...repositoryTotalFields,
  }),
  z.object({
    additions: z.number(),
    comments: z.number(),
    date: z.string(),
    deletions: z.number(),
    excerpt: z.string().nullable(),
    id: z.string(),
    kind: z.literal("pull-request"),
    repository: z.string(),
    title: z.string(),
    url: z.string(),
  }),
  z.object({
    id: z.string(),
    kind: z.literal("opened-prs"),
    merged: z.number(),
    ...repositoryTotalFields,
  }),
  z.object({
    id: z.string(),
    kind: z.literal("reviews"),
    ...repositoryTotalFields,
  }),
  z.object({
    id: z.string(),
    kind: z.literal("issues"),
    ...repositoryTotalFields,
  }),
  z.object({ id: z.string(), kind: z.literal("private"), total: z.number() }),
]);

export type TimelineEvent = z.infer<typeof timelineEventSchema>;

export type TimelineKind = TimelineEvent["kind"];

export type TimelineEventOf<Kind extends TimelineKind> = Extract<
  TimelineEvent,
  { kind: Kind }
>;

const timelineMonthSchema = z.object({
  events: z.array(timelineEventSchema),
  month: z.number(),
  year: z.number(),
});

export type TimelineMonth = z.infer<typeof timelineMonthSchema>;

export const githubProfileSchema = z.object({
  activity: activityOverviewSchema,
  calendars: z.tuple([contributionCalendarSchema], contributionCalendarSchema),
  fetchedAt: z.string(),
  identity: githubIdentitySchema,
  pinned: z.array(pinnedRepositorySchema),
  timeline: z.array(timelineMonthSchema),
});

export type GithubProfile = z.infer<typeof githubProfileSchema>;

export type GithubProfileSource = "live" | "snapshot";

export interface LoadedGithubProfile {
  profile: GithubProfile;
  source: GithubProfileSource;
}

import { z } from "zod";

const totalCountSchema = z.object({ totalCount: z.number() });

const repositoryRefSchema = z.object({ nameWithOwner: z.string() });

const optionalTextSchema = z
  .string()
  .nullish()
  .transform((value) => value?.trim() || null);

export const rawRepositoryCountSchema = z.object({
  contributions: totalCountSchema,
  repository: repositoryRefSchema,
});

export type RawRepositoryCount = z.infer<typeof rawRepositoryCountSchema>;

const levelByName = {
  FIRST_QUARTILE: 1,
  FOURTH_QUARTILE: 4,
  NONE: 0,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
} as const;

export const rawCalendarSchema = z.object({
  totalContributions: z.number(),
  weeks: z.array(
    z.object({
      contributionDays: z.array(
        z.object({
          contributionCount: z.number(),
          contributionLevel: z
            .enum([
              "NONE",
              "FIRST_QUARTILE",
              "SECOND_QUARTILE",
              "THIRD_QUARTILE",
              "FOURTH_QUARTILE",
            ])
            .transform((name) => levelByName[name]),
          date: z.string(),
          weekday: z.number().int().min(0).max(6),
        })
      ),
    })
  ),
});

export type RawCalendar = z.infer<typeof rawCalendarSchema>;

const rawPinnedSchema = z.object({
  description: optionalTextSchema,
  isPrivate: z.boolean(),
  isTemplate: z.boolean(),
  name: z.string(),
  nameWithOwner: z.string(),
  primaryLanguage: z.object({ name: z.string() }).nullable(),
  stargazerCount: z.number(),
});

export type RawPinned = z.infer<typeof rawPinnedSchema>;

const repositoryCountFields = {
  commitContributionsByRepository: z.array(rawRepositoryCountSchema),
  issueContributionsByRepository: z.array(rawRepositoryCountSchema),
  pullRequestContributionsByRepository: z.array(rawRepositoryCountSchema),
  pullRequestReviewContributionsByRepository: z.array(rawRepositoryCountSchema),
};

export const rawCollectionSchema = z.object({
  ...repositoryCountFields,
  contributionCalendar: rawCalendarSchema,
  contributionYears: z.array(z.number()),
  totalCommitContributions: z.number(),
  totalIssueContributions: z.number(),
  totalPullRequestContributions: z.number(),
  totalPullRequestReviewContributions: z.number(),
});

export type RawCollection = z.infer<typeof rawCollectionSchema>;

export const rawUserSchema = z.object({
  bio: optionalTextSchema,
  contributionsCollection: rawCollectionSchema,
  followers: totalCountSchema,
  following: totalCountSchema,
  location: optionalTextSchema,
  login: z.string(),
  name: optionalTextSchema,
  organizations: z.object({ nodes: z.array(z.object({ login: z.string() })) }),
  pinnedItems: z.object({ nodes: z.array(rawPinnedSchema) }),
  repositories: totalCountSchema,
  starredRepositories: totalCountSchema,
  twitterUsername: optionalTextSchema,
  websiteUrl: optionalTextSchema,
});

export type RawUser = z.infer<typeof rawUserSchema>;

export const rawRestUserSchema = z.object({
  created_at: z.string(),
  email: optionalTextSchema,
});

export type RawRestUser = z.infer<typeof rawRestUserSchema>;

export const rawYearCalendarsSchema = z.record(
  z.string(),
  z.object({ contributionCalendar: rawCalendarSchema })
);

const rawPullRequestSchema = z.object({
  additions: z.number(),
  bodyText: z.string(),
  comments: totalCountSchema,
  createdAt: z.string(),
  deletions: z.number(),
  merged: z.boolean(),
  title: z.string(),
  url: z.string(),
});

export const rawMonthSchema = z.object({
  ...repositoryCountFields,
  pullRequestContributionsByRepository: z.array(
    z.object({
      contributions: z.object({
        nodes: z.array(
          z.object({ pullRequest: rawPullRequestSchema.nullable() })
        ),
        totalCount: z.number(),
      }),
      repository: repositoryRefSchema,
    })
  ),
  restrictedContributionsCount: z.number(),
});

export type RawMonth = z.infer<typeof rawMonthSchema>;

export const rawMonthsSchema = z.record(z.string(), rawMonthSchema);

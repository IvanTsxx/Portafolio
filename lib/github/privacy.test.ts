import { describe, expect, test } from "bun:test";

import type { z } from "zod";

import { githubProfileSchema } from "./model";
import type { GithubProfile } from "./model";
import {
  parseActivity,
  parseIdentity,
  parsePinned,
  parseTimelineMonth,
} from "./parse";
import {
  assertPublicProfile,
  GithubPrivacyError,
  publicEmail,
} from "./privacy";
import { snapshotProfile } from "./profile";
import {
  rawCollectionSchema,
  rawMonthSchema,
  rawRestUserSchema,
  rawUserSchema,
} from "./raw";
import snapshot from "./snapshot.json";

const ALLOWED_EMAIL = "ivan@example.dev";
const REDACTED = /basement/iu;

const counted = (nameWithOwner: string, totalCount: number) => ({
  contributions: { totalCount },
  repository: { nameWithOwner },
});

const emptyCollection = {
  commitContributionsByRepository: [],
  contributionCalendar: { totalContributions: 0, weeks: [] },
  contributionYears: [],
  issueContributionsByRepository: [],
  pullRequestContributionsByRepository: [],
  pullRequestReviewContributionsByRepository: [],
  totalCommitContributions: 0,
  totalIssueContributions: 0,
  totalPullRequestContributions: 0,
  totalPullRequestReviewContributions: 0,
};

const pinnedNode = (
  nameWithOwner: string,
  description: string | null = null
) => ({
  description,
  isPrivate: false,
  isTemplate: false,
  name: nameWithOwner.split("/")[1] ?? nameWithOwner,
  nameWithOwner,
  primaryLanguage: { name: "TypeScript" },
  stargazerCount: 1,
});

const rawUser = (overrides: Partial<z.input<typeof rawUserSchema>> = {}) =>
  rawUserSchema.parse({
    bio: "Frontend engineer",
    company: "@basementstudio",
    contributionsCollection: emptyCollection,
    followers: { totalCount: 47 },
    following: { totalCount: 34 },
    location: "Tucumán",
    login: "IvanTsxx",
    name: "Ivan Bongiovanni",
    organizations: {
      nodes: [{ login: "basementstudio" }, { login: "ServalHQ" }],
    },
    pinnedItems: { nodes: [] },
    repositories: { totalCount: 55 },
    starredRepositories: { totalCount: 261 },
    twitterUsername: "IvanTsxx",
    websiteUrl: "https://bongi.dev",
    ...overrides,
  });

const rawRest = (email: string | null) =>
  rawRestUserSchema.parse({ created_at: "2022-04-22T14:59:10Z", email });

const pullRequestNode = (
  title: string,
  additions: number,
  merged: boolean
) => ({
  pullRequest: {
    additions,
    bodyText: "",
    comments: { totalCount: 0 },
    createdAt: "2026-09-02T10:00:00Z",
    deletions: 1,
    merged,
    title,
    url: `https://example.dev/${additions}`,
  },
});

describe("parseIdentity", () => {
  test("drops the company field and redacted organizations", () => {
    const identity = parseIdentity(rawUser(), rawRest(null), ALLOWED_EMAIL);

    expect(identity).not.toHaveProperty("company");
    expect(identity.organizations).toEqual(["ServalHQ"]);
  });

  test("keeps the GitHub email only when it is the site email", () => {
    const other = parseIdentity(
      rawUser(),
      rawRest("someone@basement.studio"),
      ALLOWED_EMAIL
    );
    const same = parseIdentity(
      rawUser(),
      rawRest("Ivan@Example.dev"),
      ALLOWED_EMAIL
    );

    expect(other.email).toBeNull();
    expect(same.email).toBe("Ivan@Example.dev");
  });

  test("clears free text fields that mention the redacted term", () => {
    const identity = parseIdentity(
      rawUser({
        bio: "Dev at Basement",
        websiteUrl: "https://basement.studio",
      }),
      rawRest(null),
      ALLOWED_EMAIL
    );

    expect(identity.bio).toBeNull();
    expect(identity.websiteUrl).toBeNull();
  });
});

describe("parsePinned", () => {
  test("removes pinned repositories by owner, name or description", () => {
    const user = rawUser({
      pinnedItems: {
        nodes: [
          pinnedNode("basementstudio/next-starter"),
          pinnedNode("IvanTsxx/basement-clone"),
          pinnedNode("IvanTsxx/notes", "Fork of a Basement tool"),
          pinnedNode("IvanTsxx/Portafolio"),
        ],
      },
    });

    expect(
      parsePinned(user.pinnedItems.nodes).map(
        (repository) => repository.nameWithOwner
      )
    ).toEqual(["IvanTsxx/Portafolio"]);
  });
});

describe("parseActivity", () => {
  test("removes contributed-to repositories by owner or name", () => {
    const activity = parseActivity(
      rawCollectionSchema.parse({
        ...emptyCollection,
        commitContributionsByRepository: [
          counted("basementstudio/website", 40),
          counted("IvanTsxx/BASEMENT-labs", 9),
          counted("IvanTsxx/Portafolio", 12),
        ],
        pullRequestContributionsByRepository: [counted("shadcn-ui/ui", 2)],
      })
    );

    expect(activity.repositories).toEqual([
      "IvanTsxx/Portafolio",
      "shadcn-ui/ui",
    ]);
  });
});

describe("parseTimelineMonth", () => {
  const month = parseTimelineMonth(
    { month: 9, year: 2026 },
    rawMonthSchema.parse({
      commitContributionsByRepository: [
        counted("basementstudio/website", 30),
        counted("IvanTsxx/Portafolio", 5),
      ],
      issueContributionsByRepository: [counted("basementstudio/website", 4)],
      pullRequestContributionsByRepository: [
        {
          contributions: {
            nodes: [pullRequestNode("Huge client launch", 9000, true)],
            totalCount: 3,
          },
          repository: { nameWithOwner: "basementstudio/website" },
        },
        {
          contributions: {
            nodes: [
              pullRequestNode("Port the basement hero", 500, true),
              pullRequestNode("Add cache demo", 120, true),
              pullRequestNode("Fix typo", 2, false),
            ],
            totalCount: 3,
          },
          repository: { nameWithOwner: "IvanTsxx/cache-components" },
        },
      ],
      pullRequestReviewContributionsByRepository: [
        counted("basementstudio/website", 6),
      ],
      restrictedContributionsCount: 12,
    })
  );

  test("leaves no event that names the redacted term", () => {
    expect(JSON.stringify(month)).not.toMatch(REDACTED);
  });

  test("recomputes totals from public repositories only", () => {
    const commits = month.events.find((event) => event.kind === "commits");
    const opened = month.events.find((event) => event.kind === "opened-prs");

    expect(commits).toMatchObject({ total: 5 });
    expect(opened).toMatchObject({ merged: 1, total: 3 });
  });

  test("picks the largest public pull request as the highlight", () => {
    const highlight = month.events.find(
      (event) => event.kind === "pull-request"
    );

    expect(highlight).toMatchObject({ title: "Add cache demo" });
  });

  test("drops kinds whose only repositories were redacted", () => {
    expect(month.events.map((event) => event.kind)).toEqual([
      "commits",
      "pull-request",
      "opened-prs",
      "private",
    ]);
  });
});

describe("publicEmail", () => {
  test("returns null for a missing or foreign address", () => {
    expect(publicEmail(null, ALLOWED_EMAIL)).toBeNull();
    expect(publicEmail("work@company.dev", ALLOWED_EMAIL)).toBeNull();
  });
});

describe("assertPublicProfile", () => {
  test("rejects a profile that still carries the redacted term", () => {
    const leaked: GithubProfile = {
      ...snapshotProfile(),
      pinned: [
        {
          description: null,
          language: null,
          name: "site",
          nameWithOwner: "basementstudio/site",
          stars: 0,
          visibility: "public",
        },
      ],
    };

    expect(() => assertPublicProfile(leaked)).toThrow(GithubPrivacyError);
  });
});

describe("snapshot", () => {
  test("parses as a profile and holds no redacted term", () => {
    expect(githubProfileSchema.safeParse(snapshot).success).toBe(true);
    expect(JSON.stringify(snapshot)).not.toMatch(REDACTED);
    expect(snapshot).not.toHaveProperty("identity.company");
  });
});

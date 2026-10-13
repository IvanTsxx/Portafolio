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

interface PinnedExtras {
  homepageUrl?: string | null;
  topics?: readonly string[];
}

const pinnedNode = (
  nameWithOwner: string,
  description: string | null = null,
  { homepageUrl = null, topics = [] }: PinnedExtras = {}
) => ({
  createdAt: "2025-03-14T12:00:00Z",
  description,
  forkCount: 0,
  homepageUrl,
  isPrivate: false,
  isTemplate: false,
  name: nameWithOwner.split("/")[1] ?? nameWithOwner,
  nameWithOwner,
  primaryLanguage: { name: "TypeScript" },
  pushedAt: "2025-04-01T09:30:00Z",
  repositoryTopics: { nodes: topics.map((name) => ({ topic: { name } })) },
  stargazerCount: 1,
});

const rawUser = (overrides: Partial<z.input<typeof rawUserSchema>> = {}) =>
  rawUserSchema.parse({
    avatarUrl: "https://avatars.githubusercontent.com/u/104214911?v=4",
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
  test("keeps the GitHub avatar and rejects avatars from other hosts", () => {
    const github = parseIdentity(rawUser(), rawRest(null), ALLOWED_EMAIL);
    expect(github.avatarUrl).toBe(
      "https://avatars.githubusercontent.com/u/104214911?v=4"
    );
    const foreign = parseIdentity(
      rawUser({ avatarUrl: "https://example.com/avatar.png" }),
      rawRest(null),
      ALLOWED_EMAIL
    );
    expect(foreign.avatarUrl).toBeNull();
  });

  test("keeps the company affiliation and the company organization", () => {
    const identity = parseIdentity(rawUser(), rawRest(null), ALLOWED_EMAIL);

    expect(identity.company).toBe("@basementstudio");
    expect(identity.organizations).toEqual(["basementstudio", "ServalHQ"]);
  });

  test("drops a company field that describes the work", () => {
    const identity = parseIdentity(
      rawUser({ company: "Shipping client sites at basement studio" }),
      rawRest(null),
      ALLOWED_EMAIL
    );

    expect(identity.company).toBeNull();
  });

  test("drops organizations that only resemble the company", () => {
    const identity = parseIdentity(
      rawUser({
        organizations: {
          nodes: [{ login: "basementstudio-labs" }, { login: "ServalHQ" }],
        },
      }),
      rawRest(null),
      ALLOWED_EMAIL
    );

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

  test("removes pinned repositories by topic or homepage", () => {
    const user = rawUser({
      pinnedItems: {
        nodes: [
          pinnedNode("IvanTsxx/kit", null, { topics: ["nextjs", "basement"] }),
          pinnedNode("IvanTsxx/demo", null, {
            homepageUrl: "https://demo.basement.studio",
          }),
          pinnedNode("IvanTsxx/better-auth-mp", "Mercado Pago plugin", {
            homepageUrl: "https://better-auth-mp-docs.vercel.app",
            topics: ["better-auth", "payments"],
          }),
        ],
      },
    });

    expect(parsePinned(user.pinnedItems.nodes)).toEqual([
      {
        createdAt: "2025-03-14",
        description: "Mercado Pago plugin",
        forks: 0,
        homepage: "https://better-auth-mp-docs.vercel.app",
        language: "TypeScript",
        name: "better-auth-mp",
        nameWithOwner: "IvanTsxx/better-auth-mp",
        pushedAt: "2025-04-01",
        stars: 1,
        topics: ["better-auth", "payments"],
        visibility: "public",
      },
    ]);
  });

  test("drops a homepage that is not a URL", () => {
    const [repository] = parsePinned(
      rawUser({
        pinnedItems: {
          nodes: [pinnedNode("IvanTsxx/notes", null, { homepageUrl: "soon" })],
        },
      }).pinnedItems.nodes
    );

    expect(repository?.homepage).toBeNull();
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
  test("accepts the company affiliation and organization", () => {
    const affiliated: GithubProfile = {
      ...snapshotProfile(),
      identity: {
        ...snapshotProfile().identity,
        company: "@basementstudio",
        organizations: ["basementstudio", "ServalHQ"],
      },
    };

    expect(assertPublicProfile(affiliated)).toBe(affiliated);
  });

  test("rejects a company repository even when the affiliation is allowed", () => {
    const leaked: GithubProfile = {
      ...snapshotProfile(),
      pinned: [
        {
          createdAt: "2025-03-14",
          description: null,
          forks: 0,
          homepage: null,
          language: null,
          name: "site",
          nameWithOwner: "basementstudio/site",
          pushedAt: "2025-03-14",
          stars: 0,
          topics: [],
          visibility: "public",
        },
      ],
    };

    expect(() => assertPublicProfile(leaked)).toThrow(GithubPrivacyError);
  });

  test("rejects a timeline event that names a company project", () => {
    const leaked: GithubProfile = {
      ...snapshotProfile(),
      timeline: [
        {
          events: [
            {
              id: "E-01",
              kind: "commits",
              repositories: [
                { count: 3, repository: "IvanTsxx/basement-hero" },
              ],
              total: 3,
            },
          ],
          month: 9,
          year: 2026,
        },
      ],
    };

    expect(() => assertPublicProfile(leaked)).toThrow(GithubPrivacyError);
  });
});

describe("snapshot", () => {
  test("parses as a profile and names no company repository", () => {
    const parsed = githubProfileSchema.parse(snapshot);
    const repositoryNames = [
      ...parsed.pinned.map((repository) => repository.nameWithOwner),
      ...parsed.activity.repositories,
      ...parsed.timeline.flatMap((month) =>
        month.events.flatMap((event) => {
          if ("repositories" in event) {
            return event.repositories.map((row) => row.repository);
          }
          return "repository" in event ? [event.repository] : [];
        })
      ),
    ];

    expect(repositoryNames.filter((name) => REDACTED.test(name))).toEqual([]);
    expect(() => assertPublicProfile(parsed)).not.toThrow();
  });
});

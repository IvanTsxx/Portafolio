import { Octokit } from "@octokit/rest";
import { formatDate } from "date-fns";
import { cacheLife, cacheTag } from "next/cache";

import { env } from "@/env/server";
import type { Activity } from "@/shared/components/kibo-ui/contribution-graph";
import { GITHUB_USERNAME } from "@/shared/config/site";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/lib/cache";

export const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

export async function getGitHubContributionsOctokit() {
  const { data } = await octokit.activity.listPublicEventsForUser({
    username: GITHUB_USERNAME,
  });

  return data;
}

export const getGithubGraph = async () => {
  const { data } = await octokit.activity.listPublicEventsForUser({
    username: GITHUB_USERNAME,
  });

  return data;
};

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  pull_request?: {
    merged_at: string | null;
  };
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  head: {
    ref: string;
    repo: {
      name: string;
      full_name: string;
      owner: { login: string };
    };
  };
  base: {
    ref: string;
    repo: {
      name: string;
      full_name: string;
      owner: { login: string };
    };
  };
}

export interface ProcessedContribution {
  title: string;
  description: string;
  repository: string;
  link: string;
  date: string;
  type: "feature" | "fix" | "perf" | "docs" | "refactor" | "test" | "chore";
  state: "open" | "closed" | "merged";
  kind: "pr" | "issue";
}

function extractPRType(title: string): ProcessedContribution["type"] {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.startsWith("feat")) return "feature";
  if (lowerTitle.startsWith("fix")) return "fix";
  if (lowerTitle.startsWith("perf")) return "perf";
  if (lowerTitle.startsWith("docs")) return "docs";
  if (lowerTitle.startsWith("refactor")) return "refactor";
  if (lowerTitle.startsWith("test")) return "test";
  if (lowerTitle.startsWith("chore")) return "chore";
  return "feature";
}

function extractRepoFromUrl(htmlUrl: string): string {
  const match = htmlUrl.match(/github\.com\/([^/]+\/[^/]+)\//);
  return match ? match[1] : "unknown";
}

function extractRepoOwnerFromUrl(htmlUrl: string): string {
  const match = htmlUrl.match(/github\.com\/([^/]+)\//);
  return match ? match[1] : "unknown";
}

function resolveState(item: GitHubPullRequest): ProcessedContribution["state"] {
  if (item.pull_request?.merged_at) return "merged";
  if (item.state === "closed") return "closed";
  return "open";
}

async function fetchAllPages(
  q: string,
  maxItems = 1000
): Promise<GitHubPullRequest[]> {
  const perPage = 100;
  const maxPages = Math.ceil(Math.min(maxItems, 1000) / perPage);
  const results: GitHubPullRequest[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const { data } = await octokit.request("GET /search/issues", {
      order: "desc",
      page,
      per_page: perPage,
      q,
      sort: "created",
    });

    const items = data.items as unknown as GitHubPullRequest[];
    results.push(...items);

    if (results.length >= data.total_count || items.length < perPage) break;
  }

  return results;
}

export async function fetchUserPullRequests(
  username: string,
  {
    limit = 50,
    includeOwnRepos = true,
    fromYear,
    toYear,
  }: {
    limit?: number;
    includeOwnRepos?: boolean;
    fromYear?: number;
    toYear?: number;
  } = {}
): Promise<ProcessedContribution[]> {
  "use cache";
  cacheLife(CACHE_LIFE.GITHUB_PULL_REQUESTS);
  cacheTag(CACHE_TAGS.GITHUB_PULL_REQUESTS);

  const token = env.GITHUB_TOKEN;

  if (!token) {
    console.warn("No GitHub token found.");
    return [];
  }

  try {
    const currentYear = new Date().getFullYear();
    const from = fromYear ?? currentYear;
    const to = toYear ?? currentYear;
    const dateFilter =
      fromYear || toYear ? `created:${from}-01-01..${to}-12-31` : "";

    const [openPRs, closedPRs, openIssues, closedIssues] = await Promise.all([
      fetchAllPages(`is:pr author:${username} is:open ${dateFilter}`, limit),
      fetchAllPages(`is:pr author:${username} is:closed ${dateFilter}`, limit),
      fetchAllPages(`is:issue author:${username} is:open ${dateFilter}`, limit),
      fetchAllPages(
        `is:issue author:${username} is:closed ${dateFilter}`,
        limit
      ),
    ]);

    const allItems = [...openPRs, ...closedPRs, ...openIssues, ...closedIssues];

    const seen = new Set<number>();
    const unique = allItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    const contributions: ProcessedContribution[] = unique
      .filter((item) => {
        if (includeOwnRepos) return true;
        return extractRepoOwnerFromUrl(item.html_url) !== username;
      })
      .toSorted((a, b) => {
        const dateA =
          a.pull_request?.merged_at ||
          a.closed_at ||
          a.updated_at ||
          a.created_at;
        const dateB =
          b.pull_request?.merged_at ||
          b.closed_at ||
          b.updated_at ||
          b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .map((item) => {
        const isPR = !!item.pull_request;
        const repository = extractRepoFromUrl(item.html_url);
        const state = resolveState(item);
        const relevantDate =
          item.pull_request?.merged_at ||
          item.closed_at ||
          item.updated_at ||
          item.created_at;

        return {
          date: formatDate(relevantDate, "dd/MM/yyyy"),
          description: `${isPR ? "PR" : "Issue"} in ${repository}`,
          kind: isPR ? "pr" : "issue",
          link: item.html_url,
          repository,
          state,
          title: item.title,
          type: extractPRType(item.title),
        };
      });

    return contributions;
  } catch (error) {
    console.error("Error fetching GitHub contributions:", error);
    return [];
  }
}

interface GitHubContributionsResponse {
  contributions: Activity[];
}

export async function getGitHubContributions(): Promise<Activity[]> {
  "use cache";
  cacheLife(CACHE_LIFE.GITHUB_CONTRIBUTIONS);
  cacheTag(CACHE_TAGS.GITHUB_CONTRIBUTIONS);

  const res = await fetch(
    `${env.GITHUB_CONTRIBUTIONS_API_URL}/v4/${GITHUB_USERNAME}?y=last`
  );
  const data = (await res.json()) as GitHubContributionsResponse;
  return data.contributions;
}

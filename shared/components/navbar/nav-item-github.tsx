import { cacheLife, cacheTag } from "next/cache";

import { env } from "@/env/server";
import { GitHubStars } from "@/shared/components/github/github-stars";
import { SOURCE_CODE_GITHUB_REPO } from "@/shared/config/site";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/lib/cache";

async function getStargazerCount(): Promise<number> {
  "use cache";
  cacheLife(CACHE_LIFE.GITHUB_STARGAZERS);
  cacheTag(CACHE_TAGS.GITHUB_STARGAZERS);

  try {
    const response = await fetch(
      `https://api.github.com/repos/${SOURCE_CODE_GITHUB_REPO}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const json = (await response.json()) as { stargazers_count?: number };
    return Number(json?.stargazers_count) || 0;
  } catch {
    return 0;
  }
}

export async function NavItemGitHub() {
  const stargazersCount = await getStargazerCount();

  return (
    <GitHubStars
      repo={SOURCE_CODE_GITHUB_REPO}
      stargazersCount={stargazersCount}
    />
  );
}

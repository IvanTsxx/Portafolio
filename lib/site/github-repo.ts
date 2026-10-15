import { cacheLife } from "next/cache";
import { z } from "zod";

import { siteConfig } from "@/lib/site/config";

const repoResponseSchema = z.object({
  stargazers_count: z.number().int().nonnegative(),
});

export const repoUrl = `https://github.com/${siteConfig.repository}`;

const compactCount = new Intl.NumberFormat("en-US", { notation: "compact" });

export const formatStarCount = (count: number) => compactCount.format(count);

const requestHeaders = (token: string | undefined) => {
  const headers = new Headers({
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  });
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
};

export const fetchRepoStars = async (): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${siteConfig.repository}`,
      {
        headers: requestHeaders(process.env.GITHUB_TOKEN),
      }
    );
    if (!response.ok) {
      return null;
    }
    return repoResponseSchema.parse(await response.json()).stargazers_count;
  } catch {
    return null;
  }
};

export const getRepoStars = async () => {
  "use cache";
  cacheLife("hours");
  return await fetchRepoStars();
};

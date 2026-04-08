// oxlint-disable sort-keys
export const CACHE_TAGS = {
  // GitHub (external API data)
  GITHUB_CONTRIBUTIONS: "GITHUB_CONTRIBUTIONS",
  GITHUB_PULL_REQUESTS: "GITHUB_PULL_REQUESTS",
  GITHUB_STARGAZERS: "GITHUB_STARGAZERS",

  // Comments & Reactions (DB-backed, user-generated)
  COMMENTS_BY_SLUG: (slug: string) => `COMMENTS-${slug}`,
  POST_REACTIONS: (slug: string) => `POST_REACTIONS-${slug}`,
  GET_ALL_THOUGHTS: "GET_ALL_THOUGHTS",
  GET_ALL_TAGS: "GET_ALL_TAGS",
  GET_RECENT_THOUGHTS: "GET_RECENT_THOUGHTS",
  GET_THOUGHT_BY_ID: (slug: string) => `GET_THOUGHT_BY_ID-${slug}`,
} as const;

export const CACHE_LIFE = {
  // GitHub — external API, revalidate daily
  GITHUB_CONTRIBUTIONS: "days",
  GITHUB_PULL_REQUESTS: "days",
  GITHUB_STARGAZERS: "days",

  // Comments & Reactions — user-generated, revalidate frequently
  COMMENTS_BY_SLUG: "minutes",
  POST_REACTIONS: "minutes",
  GET_ALL_THOUGHTS: "minutes",
  GET_ALL_TAGS: "minutes",
  GET_RECENT_THOUGHTS: "minutes",
  GET_THOUGHT_BY_ID: "minutes",
} as const;

import { execSync } from "node:child_process";

import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { codeTheme } from "./lib/content/code-theme";

const readGit = (command: string) => {
  try {
    return execSync(command, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const gitRevision =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
  readGit("git rev-parse --short HEAD") ||
  "local";

const recentCommits = readGit(
  'git log -5 --no-merges --invert-grep --grep="route dates" --format=%h%x09%s'
);

const nextConfig: NextConfig = {
  cacheComponents: true,
  env: {
    NEXT_PUBLIC_GIT_LOG: recentCommits,
    NEXT_PUBLIC_GIT_SHA: gitRevision,
  },
  images: {
    remotePatterns: [{ hostname: "i.scdn.co", protocol: "https" }],
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  partialPrefetching: true,
  reactCompiler: true,
  redirects: () =>
    Promise.resolve([
      { destination: "/experiments", permanent: true, source: "/lab" },
      {
        destination: "/experiments/:slug",
        permanent: true,
        source: "/lab/:slug",
      },
    ]),
  rewrites: () =>
    Promise.resolve([
      { destination: "/markdown/notes/:slug", source: "/notes/:slug.md" },
      { destination: "/markdown/notes/:slug", source: "/notes/:slug.mdx" },
      {
        destination: "/markdown/experiments/:slug",
        source: "/experiments/:slug.md",
      },
      {
        destination: "/markdown/registry/:slug",
        source: "/registry/:slug.md",
      },
      { destination: "/markdown/skills/:slug", source: "/skills/:slug.md" },
    ]),
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      "rehype-slug",
      ["rehype-pretty-code", { keepBackground: false, theme: codeTheme }],
    ],
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);

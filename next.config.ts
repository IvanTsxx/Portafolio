import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { codeTheme } from "./lib/content/code-theme";

const nextConfig: NextConfig = {
  cacheComponents: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  partialPrefetching: true,
  reactCompiler: true,
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

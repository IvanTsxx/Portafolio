import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { codeTheme } from "./lib/content/code-theme";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactCompiler: true,
  redirects: () =>
    Promise.resolve([
      { destination: "/notes", permanent: true, source: "/work" },
      { destination: "/notes/:slug", permanent: true, source: "/work/:slug" },
      { destination: "/notes", permanent: true, source: "/blog" },
      { destination: "/notes/:slug", permanent: true, source: "/blog/:slug" },
      {
        destination: "/experiments",
        permanent: true,
        source: "/lab/:slug(blueprint-intersections|module-assembly)",
      },
      { destination: "/experiments", permanent: true, source: "/lab" },
      {
        destination: "/experiments/:slug",
        permanent: true,
        source: "/lab/:slug",
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

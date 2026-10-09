import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { codeTheme } from "./lib/content/code-theme";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactCompiler: true,
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

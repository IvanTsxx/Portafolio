import { evaluate } from "@mdx-js/mdx";
import { cacheLife } from "next/cache";
import * as runtime from "react/jsx-runtime";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { codeTheme } from "@/lib/content/code-theme";
import { mdxComponents } from "@/mdx-components";

const leadingTitlePattern = /^#\s[^\n]*\n+/u;

export const SkillBody = async ({ body }: { body: string }) => {
  "use cache";
  cacheLife("max");
  const { default: Content } = await evaluate(
    body.replace(leadingTitlePattern, ""),
    {
      ...runtime,
      format: "md",
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, { keepBackground: false, theme: codeTheme }],
      ],
      remarkPlugins: [remarkGfm],
    }
  );
  return (
    <div className="max-w-3xl min-w-0">
      <Content components={mdxComponents} />
    </div>
  );
};

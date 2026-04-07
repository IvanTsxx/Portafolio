import rehypeShiki from "@shikijs/rehype/core";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/shared/components/mdx/mdx-components";
import { highlight } from "@/shared/utils/shiki/highlight";
import { rehypeShikiOptions } from "@/shared/utils/shiki/rehype-shiki-options";

import { rehypeCodeLanguage } from "../utils/shiki/rehipe-code-language";

const highlighter = await highlight();

export const Markdown = ({ content }: { content: string }) => (
  <MDXRemote
    source={content}
    components={mdxComponents}
    options={{
      mdxOptions: {
        rehypePlugins: [
          rehypeCodeLanguage,
          [rehypeShiki, highlighter, rehypeShikiOptions],
        ],
        remarkPlugins: [remarkGfm],
      },
    }}
  />
);

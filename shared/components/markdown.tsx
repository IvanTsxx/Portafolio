import rehypeShiki from "@shikijs/rehype/core";
import { MDXRemote } from "next-mdx-remote/rsc";
import { connection } from "next/server";
import { Suspense } from "react";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/shared/components/mdx/mdx-components";
import { rehypeHeadingId } from "@/shared/utils/rehype-heading-id";
import { highlight } from "@/shared/utils/shiki/highlight";
import { rehypeShikiOptions } from "@/shared/utils/shiki/rehype-shiki-options";

import { rehypeCodeLanguage } from "../utils/shiki/rehipe-code-language";

// Lazy initialization: the highlighter is created on first render,
// after the page has established dynamic data access via connection().
// This avoids Date.now() calls during module evaluation (from
// @shikijs/vscode-textmate) which would trigger Cache Components errors.
let highlighterPromise: ReturnType<typeof highlight> | null = null;

const getHighlighter = () => {
  highlighterPromise ??= highlight();
  return highlighterPromise;
};

export async function Markdown({ content }: { content: string }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarkdownContent content={content} />
    </Suspense>
  );
}

const MarkdownContent = async ({ content }: { content: string }) => {
  await connection();
  const highlighter = await getHighlighter();
  return (
    <MDXRemote
      source={content}
      components={mdxComponents}
      options={{
        mdxOptions: {
          rehypePlugins: [
            rehypeHeadingId,
            rehypeCodeLanguage,
            [rehypeShiki, highlighter, rehypeShikiOptions],
          ],
          remarkPlugins: [remarkGfm],
        },
      }}
    />
  );
};

"use client";

import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useMDXComponents } from "@/mdx-components";

interface MDXClientRendererProps {
  content: string;
  className?: string;
}

export function MDXClientRenderer({
  content,
  className,
}: MDXClientRendererProps) {
  // We utilize the same component map, casting it to the specific type required by ReactMarkdown
  const components = useMDXComponents({}) as ComponentProps<
    typeof ReactMarkdown
  >["components"];

  return (
    <div className={cn("prose prose-slate max-w-none", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useMDXComponents } from "@/mdx-components";

interface MDXRendererProps {
  content: string;
  className?: string;
}

export async function MDXRenderer({ content, className }: MDXRendererProps) {
  const components = useMDXComponents({});

  return (
    <div className={cn("prose prose-slate max-w-none", className)}>
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  );
}

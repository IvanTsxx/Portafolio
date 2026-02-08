import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h1: (props) => (
    <h1
      className="mt-8 scroll-m-20 font-bold text-4xl tracking-tight lg:text-5xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-10 scroll-m-20 border-border/40 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 scroll-m-20 font-semibold text-2xl tracking-tight"
      {...props}
    />
  ),
  p: (props) => <p className="not-first:mt-6 leading-relaxed" {...props} />,
  ul: (props) => <ul className="my-6 ml-6 list-disc" {...props} />,
  ol: (props) => <ol className="my-6 ml-6 list-decimal" {...props} />,
  li: (props) => <li className="mt-2 leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-primary/30 border-l-2 pl-6 text-muted-foreground italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="relative block rounded-lg bg-muted p-4 font-mono text-sm"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-6 mb-4 overflow-x-auto rounded-lg bg-muted p-4"
      {...props}
    />
  ),
  a: (props) => (
    <a
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  hr: (props) => <hr className="my-8 border-border/40" {...props} />,
  table: (props) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props} />
    </div>
  ),
  tr: (props) => (
    <tr className="m-0 border-border/40 border-t p-0" {...props} />
  ),
  th: (props) => (
    <th
      className="border border-border/40 px-4 py-2 text-left font-bold"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-border/40 px-4 py-2 text-left" {...props} />
  ),
};

export function useMDXComponents(
  otherComponents?: MDXComponents,
): MDXComponents {
  return {
    ...components,
    ...otherComponents,
  };
}

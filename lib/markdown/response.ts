import { absoluteUrl } from "@/lib/site/seo";

export interface MarkdownResponseOptions {
  canonicalPath?: `/${string}`;
  indexable?: boolean;
}

export const markdownResponse = (
  body: string,
  { canonicalPath, indexable = true }: MarkdownResponseOptions = {}
) => {
  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  if (canonicalPath) {
    headers.set("Link", `<${absoluteUrl(canonicalPath)}>; rel="canonical"`);
  }
  if (!indexable) {
    headers.set("X-Robots-Tag", "noindex");
  }
  return new Response(body, { headers });
};

export const plainTextResponse = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });

import { loadDesignMarkdown } from "./load";

export const designMarkdownResponse = () =>
  new Response(loadDesignMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });

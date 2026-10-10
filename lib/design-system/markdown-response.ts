import { loadDesignMarkdown } from "./load";

export const designMarkdownResponse = async () =>
  new Response(await loadDesignMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });

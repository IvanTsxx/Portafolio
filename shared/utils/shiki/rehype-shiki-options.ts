import type { RehypeShikiCoreOptions } from "@shikijs/rehype/core";

const rehypeShikiOptions: RehypeShikiCoreOptions = {
  themes: {
    dark: "one-dark-pro",
    light: "one-light",
  },
  transformers: [
    {
      pre(node) {
        // 'this.options.lang' is the language Shiki detected
        node.properties["data-language"] = this.options.lang;

        // Extract title from fence meta (e.g., title="next.config.ts")
        const meta = this.options?.meta;
        if (meta?.__raw) {
          const titleMatch = meta.__raw.match(/title="([^"]+)"/);
          if (titleMatch) {
            const [_, title] = titleMatch;
            node.properties["data-title"] = title;
          }
        }
      },
    },
  ],
};

export { rehypeShikiOptions };

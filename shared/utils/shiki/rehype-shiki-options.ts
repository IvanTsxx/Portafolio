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
      },
    },
  ],
};

export { rehypeShikiOptions };

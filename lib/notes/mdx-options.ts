// lib/notes/mdx-options.ts
import remarkGfm from 'remark-gfm'
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import type { PluggableList } from 'unified'

const prettyCodeOptions: PrettyCodeOptions = {
  // Bundled editor theme — real token hues (keywords/strings/types), not flat grey.
  // keepBackground false → panel bg comes from notes-code.css (portal ink, not GitHub navy).
  theme: 'github-dark-dimmed',
  keepBackground: false,
  defaultLang: 'tsx',
}

export const noteMdxOptions: {
  remarkPlugins: PluggableList
  rehypePlugins: PluggableList
} = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
}

// lib/notes/mdx-options.ts
import remarkGfm from 'remark-gfm'
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import type { PluggableList } from 'unified'
import { portalCodeTheme } from '@/lib/notes/shiki-theme'

const prettyCodeOptions: PrettyCodeOptions = {
  // Must be VS Code JSON shape with `tokenColors` (not Shiki `settings`)
  // so rehype-pretty-code's isJSONTheme() recognizes it.
  theme: portalCodeTheme,
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

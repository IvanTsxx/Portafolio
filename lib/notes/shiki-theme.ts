// lib/notes/shiki-theme.ts
// VS Code JSON theme (`tokenColors`) for rehype-pretty-code isJSONTheme().
// Readable editor hierarchy — warm greys, not neon chrome.
import type { Options as PrettyCodeOptions } from 'rehype-pretty-code'

const tokenColors = [
  { settings: { foreground: '#e8e4dc', background: '#12110f' } },
  // Comments — clearly quieter
  {
    scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
    settings: { foreground: '#6a6560', fontStyle: 'italic' },
  },
  // Strings — warm sand (distinct from body)
  {
    scope: [
      'string',
      'string.quoted',
      'string.template',
      'string.regexp',
      'meta.template.expression',
    ],
    settings: { foreground: '#c9b896' },
  },
  // Keywords / storage — brightest paper
  {
    scope: [
      'keyword',
      'keyword.control',
      'keyword.operator.new',
      'storage.type',
      'storage.modifier',
      'constant.language',
      'keyword.control.import',
      'keyword.control.from',
      'keyword.control.export',
      'meta.import',
    ],
    settings: { foreground: '#f3ead8', fontStyle: 'bold' },
  },
  // Functions
  {
    scope: [
      'entity.name.function',
      'support.function',
      'meta.function-call',
      'meta.function-call entity.name.function',
    ],
    settings: { foreground: '#efe8dc' },
  },
  // Types / classes / components
  {
    scope: [
      'entity.name.type',
      'entity.name.class',
      'support.type',
      'support.class',
      'entity.other.inherited-class',
      'support.class.component',
      'entity.name.tag',
    ],
    settings: { foreground: '#d2c4b0' },
  },
  // Variables / params
  {
    scope: [
      'variable',
      'variable.other',
      'variable.parameter',
      'meta.definition.variable',
      'variable.other.readwrite',
    ],
    settings: { foreground: '#ddd6cb' },
  },
  // Numbers / consts
  {
    scope: [
      'constant',
      'constant.numeric',
      'constant.language.boolean',
      'support.constant',
      'constant.character',
    ],
    settings: { foreground: '#e0c9a0' },
  },
  // Punctuation / operators — dim
  {
    scope: [
      'punctuation',
      'meta.brace',
      'meta.delimiter',
      'keyword.operator',
      'keyword.operator.assignment',
      'keyword.operator.comparison',
    ],
    settings: { foreground: '#857e76' },
  },
  // JSX / HTML attrs
  {
    scope: ['entity.other.attribute-name', 'meta.tag.attributes'],
    settings: { foreground: '#b8aea0' },
  },
  // Property keys
  {
    scope: ['meta.object-literal.key', 'support.type.property-name'],
    settings: { foreground: '#cfc4b4' },
  },
  { scope: ['invalid'], settings: { foreground: '#e8e4dc', fontStyle: 'underline' } },
]

export const portalCodeTheme = {
  name: 'portal-code',
  type: 'dark' as const,
  colors: {
    'editor.background': '#12110f',
    'editor.foreground': '#e8e4dc',
  },
  tokenColors,
} as unknown as NonNullable<PrettyCodeOptions['theme']>

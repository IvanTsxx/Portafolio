// components/mdx/note-components.tsx
// Custom MDX islands for notes. Prose (p/h/ul/code/…) is styled by shadcn/typeset.
import * as React from 'react'
import type { MDXComponents } from 'mdx/types'
import { AsciiRule } from '@/lib/ascii/components/ascii-rule'
import { Label } from '@/components/primitives/label'
import { Frame } from '@/components/primitives/frame'
import { portal } from '@/lib/portal/styles'
import { CacheFlowDiagram } from '@/components/mdx/cache-flow-diagram'
import { CacheLifeProfiles } from '@/components/mdx/cache-life-profiles'
import { ContentTypesTable } from '@/components/mdx/content-types-table'
import { ErrorCard } from '@/components/mdx/error-card'
import { InvalidationCompare } from '@/components/mdx/invalidation-compare'

function Hr() {
  return (
    <div className="not-typeset my-10 opacity-30" aria-hidden="true">
      <AsciiRule />
    </div>
  )
}

/** Callout — usable as <Callout tone="signal">…</Callout> in MDX */
function Callout({
  tone = 'mid',
  title,
  children,
}: {
  tone?: 'mid' | 'signal' | 'dim'
  title?: string
  children?: React.ReactNode
}) {
  const border =
    tone === 'signal'
      ? 'border-p-signal/55'
      : 'border-p-bright/16'

  return (
    <aside
      className={`not-typeset mt-[1.35em] border bg-p-bright/4 p-4 text-p-mid [text-shadow:0_0_12px_var(--color-p-void)] ${border}`}
      role="note"
    >
      {title ? (
        <p
          className={`${portal.label} mb-2 ${tone === 'signal' ? 'text-p-signal' : ''}`}
        >
          {title}
        </p>
      ) : null}
      <div className="text-[14px] leading-relaxed [&_p]:m-0">{children}</div>
    </aside>
  )
}

/** FieldPreview — embeds a live ASCII panel frame in prose (client island inside) */
function FieldPreview({
  label = 'FIELD',
  children,
}: {
  label?: string
  children?: React.ReactNode
}) {
  return (
    <Frame
      className="not-typeset mb-6"
      contentPadding="none"
      header={
        <Label index="MDX" tone="dim">
          {label}
        </Label>
      }
    >
      <div className="relative h-40">{children}</div>
    </Frame>
  )
}

export const noteComponents = {
  hr: Hr,
  Callout,
  FieldPreview,
  AsciiRule,
  Label,
  CacheFlowDiagram,
  CacheLifeProfiles,
  ContentTypesTable,
  ErrorCard,
  InvalidationCompare,
} satisfies MDXComponents

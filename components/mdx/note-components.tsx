// components/mdx/note-components.tsx
// Custom MDX islands for notes. Prose (p/h/ul/code/…) is styled by shadcn/typeset.
import * as React from 'react'
import type { MDXComponents } from 'mdx/types'
import { AsciiRule } from '@/lib/ascii/components/ascii-rule'
import { Label } from '@/components/primitives/label'
import { Frame } from '@/components/primitives/frame'

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
      ? 'color-mix(in oklab, var(--p-signal) 55%, transparent)'
      : 'color-mix(in oklab, var(--p-bright) 16%, transparent)'

  return (
    <aside
      className="not-typeset mt-[1.35em] border p-4"
      role="note"
      style={{
        borderColor: border,
        background: 'color-mix(in oklab, var(--p-void) 82%, transparent)',
        color: 'var(--p-mid)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        textShadow: '0 0 16px var(--p-void), 0 0 32px var(--p-void)',
      }}
    >
      {title ? (
        <p
          className="portal-mono mb-2"
          style={{
            fontSize: 10,
            color: tone === 'signal' ? 'var(--p-signal)' : 'var(--p-dim)',
            fontWeight: 600,
          }}
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
} satisfies MDXComponents

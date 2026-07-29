// components/mdx/note-components.tsx
// Custom MDX components for notes — all RSC (no "use client").
import * as React from 'react'
import type { MDXComponents } from 'mdx/types'
import { AsciiRule } from '@/lib/ascii/components/ascii-rule'
import { Label } from '@/components/primitives/label'
import { Frame } from '@/components/primitives/frame'

function P({ children }: { children?: React.ReactNode }) {
  return (
    <p className="font-sans text-ax-mid mb-5" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
      {children}
    </p>
  )
}

function H2({ children }: { children?: React.ReactNode }) {
  return (
    <h2
      className="font-sans font-semibold text-ax-bright mt-10 mb-4"
      style={{ fontSize: 'var(--text-xl)', letterSpacing: '-0.02em' }}
    >
      {children}
    </h2>
  )
}

function H3({ children }: { children?: React.ReactNode }) {
  return (
    <h3
      className="font-sans font-semibold text-ax-bright mt-8 mb-3"
      style={{ fontSize: 'var(--text-lg)', letterSpacing: '-0.015em' }}
    >
      {children}
    </h3>
  )
}

function Ul({ children }: { children?: React.ReactNode }) {
  return (
    <ul className="mb-5 space-y-2" role="list">
      {children}
    </ul>
  )
}

function Li({ children }: { children?: React.ReactNode }) {
  return (
    <li
      className="font-sans text-ax-mid pl-4 border-l border-ax-line"
      style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}
    >
      {children}
    </li>
  )
}

function Strong({ children }: { children?: React.ReactNode }) {
  return <strong className="font-semibold text-ax-bright">{children}</strong>
}

function A({ href, children }: { href?: string; children?: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-ax-signal underline underline-offset-4 decoration-ax-line hover:decoration-ax-signal transition-colors"
      style={{ transitionDuration: 'var(--dur-micro)' }}
    >
      {children}
    </a>
  )
}

function InlineCode({ children }: { children?: React.ReactNode }) {
  return (
    <code
      className="font-mono text-ax-bright bg-ax-ink border border-ax-line px-1"
      style={{ fontSize: '0.9em' }}
    >
      {children}
    </code>
  )
}

function Pre({ children }: { children?: React.ReactNode }) {
  return (
    <pre
      className="font-mono text-ax-bright bg-ax-ink border border-ax-line p-4 overflow-x-auto mb-5"
      style={{ fontSize: 'var(--text-2xs)', lineHeight: 1.5 }}
    >
      {children}
    </pre>
  )
}

function Code({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  // fenced blocks arrive as <pre><code className="language-*">
  if (className) {
    return <code className={className}>{children}</code>
  }
  return <InlineCode>{children}</InlineCode>
}

function Hr() {
  return (
    <div className="my-10 opacity-30">
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
    tone === 'signal' ? 'border-ax-signal' : tone === 'dim' ? 'border-ax-dim' : 'border-ax-line'

  return (
    <aside className={`border ${border} bg-ax-ink p-4 mb-6`} role="note">
      {title ? (
        <Label tone={tone === 'signal' ? 'signal' : 'dim'} className="mb-2 block">
          {title}
        </Label>
      ) : null}
      <div className="[&>p]:mb-0 [&>p:last-child]:mb-0">{children}</div>
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
      className="mb-6"
      contentPadding="none"
      header={
        <Label index="MDX" tone="dim">
          {label}
        </Label>
      }
    >
      <div className="h-40 relative">{children}</div>
    </Frame>
  )
}

export const noteComponents = {
  p: P,
  h2: H2,
  h3: H3,
  ul: Ul,
  li: Li,
  strong: Strong,
  a: A,
  code: Code,
  pre: Pre,
  hr: Hr,
  Callout,
  FieldPreview,
  AsciiRule,
  Label,
} satisfies MDXComponents

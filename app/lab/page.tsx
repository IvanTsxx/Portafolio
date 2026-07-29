// app/lab/page.tsx — RSC shell
import * as React from 'react'
import type { Metadata } from 'next'
import { Label } from '@/components/primitives/label'
import { LabExplorations } from './lab-explorations'

export const metadata: Metadata = {
  title: 'Lab',
}

export default function LabPage() {
  return (
    <div
      className="w-full max-w-[var(--max-grid)] mx-auto pt-24 pb-20"
      style={{ paddingInline: 'var(--gutter)' }}
    >
      <header className="mb-12 max-w-[52ch]">
        <Label index="LAB" tone="signal" className="mb-4">
          Explorations
        </Label>
        <h1
          className="font-sans font-semibold text-ax-bright mb-4"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            letterSpacing: '-0.035em',
            lineHeight: 0.97,
          }}
        >
          Generative ASCII fields
        </h1>
        <p className="font-sans text-ax-mid" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          Live density fields rendered into a monospace{' '}
          <code className="font-mono text-ax-bright">&lt;pre&gt;</code> grid. Cap: 9000 cells.
          Press <kbd className="font-mono text-ax-signal">~</kbd> for debug HUD.
        </p>
      </header>

      <LabExplorations />
    </div>
  )
}

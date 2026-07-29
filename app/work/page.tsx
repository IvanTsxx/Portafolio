// app/work/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { Label } from '@/components/primitives/label'
import { WORK } from '@/content/work'
import { WorkList } from './work-list'

export const metadata: Metadata = {
  title: 'Work',
}

export default function WorkPage() {
  return (
    <div
      className="w-full max-w-[var(--max-grid)] mx-auto pt-24 pb-20"
      style={{ paddingInline: 'var(--gutter)' }}
    >
      <header className="mb-12 max-w-[52ch]">
        <Label index="WORK" tone="signal" className="mb-4">
          Selected
        </Label>
        <h1
          className="font-sans font-semibold text-ax-bright mb-4"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            letterSpacing: '-0.035em',
            lineHeight: 0.97,
          }}
        >
          Projects that ship systems
        </h1>
        <p className="font-sans text-ax-mid" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          Generative interfaces, agent tooling, and edge UI — indexed, not marketed.
        </p>
      </header>

      <WorkList items={WORK} />
    </div>
  )
}

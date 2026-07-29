// app/about/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { Label } from '@/components/primitives/label'
import { AsciiRule } from '@/lib/ascii/components/ascii-rule'

export const metadata: Metadata = {
  title: 'About',
}

export default function AboutPage() {
  return (
    <div className="theme-paper min-h-[calc(100vh-3rem)]">
      <div
        className="w-full max-w-[var(--max-grid)] mx-auto pt-24 pb-20"
        style={{ paddingInline: 'var(--gutter)' }}
      >
        <header className="mb-12 max-w-[52ch]">
          <Label index="ABOUT" tone="dim" className="mb-4 !text-[oklch(32%_0_0)]">
            Profile
          </Label>
          <h1
            className="font-sans font-semibold mb-4"
            style={{
              color: 'oklch(14% 0 0)',
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              letterSpacing: '-0.035em',
              lineHeight: 0.97,
            }}
          >
            AX builds generative systems from Tucumán.
          </h1>
          <p
            className="font-sans"
            style={{ color: 'oklch(32% 0 0)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}
          >
            Frontend developer based in San Miguel de Tucumán, Argentina. Specializing in
            Next.js, TypeScript, AI SDK tooling, and agent surfaces. This site is both
            portfolio and engine demo — ASCII fields, a 900ms portal, and chrome that
            stays readable to people and to agents.
          </p>
        </header>

        <div className="mb-10 max-w-[58ch] opacity-40">
          <AsciiRule />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[58ch]">
          {[
            { k: 'LOCATION', v: 'San Miguel de Tucumán, Argentina' },
            { k: 'FOCUS', v: 'Generative UI · agent tooling · edge delivery' },
            { k: 'STACK', v: 'Next.js · TypeScript · AI SDK · eve · Motion · Three' },
            { k: 'STATUS', v: 'Open to focused contracts' },
            { k: 'CONTACT', v: 'Use the + panel — bottom right' },
            { k: 'AGENTS', v: 'Prefer structured briefs · RSC-first · clear constraints' },
          ].map(({ k, v }) => (
            <div key={k}>
              <dt
                className="font-mono mb-2"
                style={{ color: 'oklch(32% 0 0)', fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
              >
                {k}
              </dt>
              <dd
                className="font-sans"
                style={{ color: 'oklch(14% 0 0)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

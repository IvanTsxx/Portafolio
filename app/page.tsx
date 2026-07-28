// app/page.tsx
// Home page — RSC, no "use client".
// Phyllotaxis ASCII fills the viewport; h1 uses clip-path line reveal (no scramble).
import * as React from 'react'
import type { Metadata } from 'next'
import { PhyllotaxisCanvas }     from '@/lib/ascii/components/phyllotaxis-canvas'
import { AsciiRule }             from '@/lib/ascii/components/ascii-rule'
import { ClipRevealHeading }     from '@/components/transitions/clip-reveal-heading'
import { HomeNav }               from '@/components/site/home-nav'

export const metadata: Metadata = {
  title: 'AX — Frontend Developer',
}

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-3rem)] flex flex-col">
      {/* ASCII field — full-bleed background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <PhyllotaxisCanvas className="w-full h-full" />
        {/* Vignette: fades field into ax-void at top/bottom so text remains readable */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, oklch(3% 0 0) 0%, transparent 30%, transparent 70%, oklch(3% 0 0) 100%)',
          }}
        />
      </div>

      {/* Content — relative so it sits above the ASCII layer */}
      <div
        className="relative z-10 flex flex-col flex-1 w-full max-w-[var(--max-grid)] mx-auto"
        style={{ padding: '4rem var(--gutter)' }}
      >
        {/* Hero block */}
        <div className="flex-1 flex flex-col justify-center gap-5" style={{ maxWidth: '52ch' }}>
          <p
            className="font-mono uppercase text-ax-signal"
            style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
          >
            Frontend Developer · 2026
          </p>

          {/* ClipRevealHeading handles the progressive-enhancement reveal.
              Server renders plain text; client adds the clip-path transition. */}
          <ClipRevealHeading
            lines={['Building at the', 'edge of generative', 'systems.']}
            as="h1"
            className="font-sans font-semibold text-ax-bright"
            style={{
              fontSize:       'clamp(2.5rem, 6vw, 5.5rem)',
              lineHeight:     '0.93',
              letterSpacing:  '-0.04em',
            } as React.CSSProperties}
            delay={200}
            stagger={70}
          />

          <p
            className="font-sans text-ax-mid"
            style={{ fontSize: 'var(--text-sm)', lineHeight: '1.6', maxWidth: '44ch' }}
          >
            Next.js · TypeScript · AI SDK · eve.
            Currently open to focused contracts.
          </p>

          {/* CTA row */}
          <nav className="flex items-center gap-6 pt-2" aria-label="Primary navigation">
            <a
              href="/work"
              className="font-mono uppercase text-ax-bright border-b border-ax-line hover:border-ax-bright hover:text-ax-signal transition-colors"
              style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.12em', transitionDuration: 'var(--dur-micro)' }}
            >
              Work
            </a>
            <a
              href="/notes"
              className="font-mono uppercase text-ax-mid hover:text-ax-bright transition-colors"
              style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.12em', transitionDuration: 'var(--dur-micro)' }}
            >
              Notes
            </a>
            <a
              href="/lab"
              className="font-mono uppercase text-ax-mid hover:text-ax-bright transition-colors"
              style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.12em', transitionDuration: 'var(--dur-micro)' }}
            >
              Lab
            </a>
          </nav>
        </div>

        {/* Rule separates hero from index strip */}
        <div className="mt-16 mb-4">
          <AsciiRule className="opacity-30" />
        </div>

        {/* Selected work index */}
        <HomeNav />
      </div>
    </div>
  )
}

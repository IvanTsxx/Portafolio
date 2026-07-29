'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { PortalLink } from '@/lib/portal/portal-link'
import { IDENTITY } from '@/content/identity'
import { HighlightMark } from '@/components/ui/highlight-mark'

const LexiconVortex = dynamic(
  () => import('./lexicon-vortex').then((m) => m.LexiconVortex),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-ax-void" aria-hidden="true" />
    ),
  },
)

/**
 * Horizon hero — gray brief (person) + void lexicon vortex (craft).
 * Agent status strip mirrors IDENTITY.agent for both audiences.
 */
export function HomeHero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100vh-3rem)] flex-col overflow-hidden md:flex-row"
    >
      {/* Person side */}
      <aside className="relative z-10 flex w-full flex-col justify-between border-b border-ax-line bg-[#C4C4C0] text-[#121212] md:w-[46%] md:border-b-0 md:border-r md:border-ax-line">
        <header className="flex items-center justify-between px-6 pt-20 font-mono text-[10px] uppercase tracking-[0.16em] text-[#3A3A3A] md:px-10 md:pt-24">
          <span>{IDENTITY.name}</span>
          <span>{IDENTITY.location.short}</span>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-5 px-6 py-12 md:px-10 md:py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4A4A4A]">
            {IDENTITY.role} · from {IDENTITY.location.region}
          </p>
          <h1
            id="hero-heading"
            className="max-w-[14ch] font-sans font-semibold"
            style={{
              fontSize: 'clamp(2rem, 4.2vw, 3.5rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.035em',
            }}
          >
            <HighlightMark color="#FF4D00">
              {IDENTITY.tagline}
            </HighlightMark>
          </h1>
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-[#2A2A2A]">
            {IDENTITY.summary}
          </p>

          <nav className="mt-1 flex flex-wrap gap-2" aria-label="Primary actions">
            <PortalLink
              href="/work"
              label="WORK"
              className="bg-[#121212] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#EDEDED] transition-transform duration-[90ms] ease-out active:scale-[0.97]"
            >
              View work
            </PortalLink>
            <PortalLink
              href="/about"
              label="ABOUT"
              className="border border-[#121212] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#121212] transition-transform duration-[90ms] ease-out active:scale-[0.97]"
            >
              About
            </PortalLink>
          </nav>
        </div>

        <footer
          className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[#121212]/20 px-6 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#3A3A3A] md:px-10"
          aria-label="Agent-readable status"
        >
          {Object.entries(IDENTITY.agent).map(([k, v]) => (
            <span key={k}>
              <span className="text-[#5A5A5A]">{k}:</span> {v}
            </span>
          ))}
        </footer>
      </aside>

      {/* Craft side */}
      <div className="relative min-h-[52vh] w-full flex-1 touch-none md:min-h-0">
        <LexiconVortex className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      </div>
    </section>
  )
}

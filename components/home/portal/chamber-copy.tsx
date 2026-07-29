'use client'

import * as React from 'react'
import Link from 'next/link'
import { IVAN, WORK_STUBS, NOTE_STUBS, DESTINATIONS, type DestId } from './content'

export function ChamberCopy({
  id,
  onCopy,
  copied,
}: {
  id: DestId
  onCopy?: () => void
  copied?: boolean
}) {
  if (id === 'home') return null
  const dest = DESTINATIONS.find((d) => d.id === id)!

  return (
    <div className="portal-float portal-emerge portal-chamber-scroll">
      <p className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
        {dest.sub}
      </p>
      <h2
        style={{
          fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
          fontWeight: 600,
          letterSpacing: '-0.035em',
          lineHeight: 0.95,
        }}
      >
        {dest.label}
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed">{dest.body}</p>

      {id === 'work' && (
        <>
          <p className="portal-mono mt-8 mb-3" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            Projects · scroll · open for full page
          </p>
          <ul className="space-y-6 pb-8">
            {WORK_STUBS.map((w) => (
              <li key={w.title}>
                <Link href={w.href} className="font-semibold tracking-[-0.02em]" style={{ color: 'var(--p-bright)' }}>
                  {w.title}
                </Link>
                <p className="portal-mono mt-1" style={{ fontSize: 9, color: 'var(--p-dim)' }}>
                  {w.year}
                </p>
                <p className="mt-1 text-[14px]">{w.note}</p>
              </li>
            ))}
          </ul>
          <p className="portal-mono mb-3" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            Notes / blog
          </p>
          <ul className="space-y-6 pb-16">
            {NOTE_STUBS.map((n) => (
              <li key={n.title}>
                <Link href={n.href} className="font-semibold tracking-[-0.02em]" style={{ color: 'var(--p-bright)' }}>
                  {n.title}
                </Link>
                <p className="portal-mono mt-1" style={{ fontSize: 9, color: 'var(--p-dim)' }}>
                  {n.year}
                </p>
                <p className="mt-1 text-[14px]">{n.note}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {id === 'craft' && (
        <div className="mt-8 pb-16">
          <p className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            Core stack
          </p>
          <p style={{ color: 'var(--p-bright)' }}>{IVAN.stack.join(' · ')}</p>
          <p className="portal-mono mt-5 mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            Also learning
          </p>
          <p>{IVAN.learning.join(' · ')}</p>
          <p className="portal-mono mt-5" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            courses · {IVAN.courses.join(' · ')}
          </p>
          <Link href="/lab" className="portal-link">
            Open lab →
          </Link>
        </div>
      )}

      {id === 'studio' && (
        <ul className="mt-8 space-y-5 pb-16">
          {IVAN.cv.map((e) => (
            <li key={e.place}>
              <p className="font-semibold" style={{ color: 'var(--p-bright)' }}>
                {e.place}
              </p>
              <p className="portal-mono mt-1" style={{ fontSize: 9, color: 'var(--p-dim)' }}>
                {e.role} · {e.when}
              </p>
              <p className="mt-1 text-[14px]">{e.note}</p>
            </li>
          ))}
          <li>
            <Link href="/about" className="portal-link">
              About page →
            </Link>
          </li>
        </ul>
      )}

      {id === 'open' && (
        <div className="mt-6 pb-16">
          <p className="text-[15px] leading-relaxed">{IVAN.pitch}</p>
          <a href="mailto:hello@example.com" className="portal-link">
            Contact →
          </a>
          {onCopy && (
            <button type="button" className="portal-link" style={{ marginLeft: 16 }} onClick={onCopy}>
              {copied ? 'Prompt copied ✓' : 'Copy agent prompt'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { HighlightMark } from '@/components/ui/highlight-mark'
import { SocialLinks } from '@/components/site/social-links'
import { PortalScrollFade } from '@/components/site/portal-scroll-fade'
import {
  IVAN,
  WORK_STUBS,
  NOTE_STUBS,
  DESTINATIONS,
  OPEN_DEST,
  type DestId,
} from './content'
import { portal } from '@/lib/portal/styles'

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
  const dest =
    id === 'open' ? OPEN_DEST : DESTINATIONS.find((d) => d.id === id)
  if (!dest) return null

  return (
    <div className={portal.chamberScroll}>
      <p className={`${portal.label} mb-2`}>{dest.sub}</p>
      <h2 className="font-semibold tracking-[-0.035em] text-[clamp(1.85rem,4vw,2.75rem)] leading-[0.95]">
        <HighlightMark>{dest.label}</HighlightMark>
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed">{dest.body}</p>

      {id === 'work' && (
        <>
          <p className={`${portal.label} mt-8 mb-3`}>Experience · open for full page</p>
          <ul className="space-y-6 pb-16">
            {WORK_STUBS.map((w) => (
              <li key={w.title}>
                <Link href={w.href} className={`${portal.title}`}>
                  {w.title}
                </Link>
                <p className={`${portal.meta} mt-1`}>{w.year}</p>
                <p className="mt-1 text-[14px]">{w.note}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {id === 'notes' && (
        <>
          <p className={`${portal.label} mt-8 mb-3`}>Notes / blog</p>
          <ul className="space-y-6 pb-16">
            {NOTE_STUBS.map((n) => (
              <li key={n.title}>
                <Link href={n.href} className={portal.title}>
                  {n.title}
                </Link>
                <p className={`${portal.meta} mt-1`}>{n.year}</p>
                <p className="mt-1 text-[14px]">{n.note}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {id === 'lab' && (
        <div className="mt-8 pb-16">
          <p className={`${portal.label} mb-2`}>Personal projects · explorations</p>
          <p className="text-[14px] leading-relaxed">
            ASCII engines, portals, agent surfaces, and side builds. Glyph frames —
            hover to reveal the photo.
          </p>
          <p className={`${portal.label} mt-5 mb-2`}>Stack in play</p>
          <p className="text-p-bright">{IVAN.stack.join(' · ')}</p>
          <Link href="/lab" className={portal.link}>
            Open lab →
          </Link>
        </div>
      )}

      {id === 'about' && (
        <ul className="mt-8 space-y-5 pb-16">
          {IVAN.cv.map((e) => (
            <li key={e.place}>
              <p className={`font-semibold text-p-bright`}>{e.place}</p>
              <p className={`${portal.meta} mt-1`}>
                {e.role} · {e.when}
              </p>
              <p className="mt-1 text-[14px]">{e.note}</p>
            </li>
          ))}
          <li>
            <Link href="/about" className={portal.link}>
              About page →
            </Link>
          </li>
        </ul>
      )}

      {id === 'open' && (
        <div className="mt-6 pb-16">
          <p className="text-[15px] leading-relaxed">{IVAN.pitch}</p>
          <SocialLinks className="mt-5" />
          {onCopy && (
            <button type="button" className={portal.link} onClick={onCopy}>
              {copied ? 'Prompt copied ✓' : 'Copy agent prompt'}
            </button>
          )}
        </div>
      )}
      <PortalScrollFade />
    </div>
  )
}

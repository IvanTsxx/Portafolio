'use client'

import * as React from 'react'
import { imageToAscii, placeholderAscii } from '@/lib/ascii/image-to-ascii'
import { cn } from '@/lib/utils'

export type AsciiImageProps = {
  alt: string
  /** Optional photo — hover reveals it. Omit for ASCII-only studies. */
  src?: string | null
  /** Precomputed ASCII (.txt). When set with no src, shown as-is (fitted to frame). */
  ascii?: string | null
  className?: string
  /** Aspect ratio CSS value — locked frame for ASCII + photo */
  aspect?: string
}

type FrameMetrics = {
  cols: number
  rows: number
  /** px — sized so the glyph grid fills width */
  fontSize: number
  /** px — sized so rows fill height */
  lineHeight: number
}

/** Mono advance ≈ 0.6em for Geist Mono / ui-monospace */
const MONO_ADVANCE = 0.6

function metricsFromBox(width: number, height: number): FrameMetrics {
  const cols = Math.max(32, Math.round(width / 7))
  const rows = Math.max(16, Math.round(height / 8))
  const lineHeight = height / rows
  const fontSize = width / (cols * MONO_ADVANCE)
  return { cols, rows, fontSize, lineHeight }
}

/**
 * Fixed aspect frame. ASCII glyphs are metric-fitted to fill the same box as the photo.
 * Photo optional — without it, no hover reveal (static ASCII).
 */
export function AsciiImage({
  alt,
  src = null,
  ascii: asciiProp = null,
  className,
  aspect = '4 / 3',
}: AsciiImageProps) {
  const hasPhoto = Boolean(src)
  const frameRef = React.useRef<HTMLElement>(null)
  const [metrics, setMetrics] = React.useState<FrameMetrics>({
    cols: 48,
    rows: 26,
    fontSize: 10,
    lineHeight: 12,
  })
  const [ascii, setAscii] = React.useState(asciiProp ?? '')
  const [ready, setReady] = React.useState(Boolean(asciiProp))
  const [failed, setFailed] = React.useState(false)
  const [touched, setTouched] = React.useState(false)

  React.useEffect(() => {
    const el = frameRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (!box || box.width < 8 || box.height < 8) return
      const next = metricsFromBox(box.width, box.height)
      setMetrics((prev) =>
        prev.cols === next.cols &&
        prev.rows === next.rows &&
        Math.abs(prev.fontSize - next.fontSize) < 0.05
          ? prev
          : next,
      )
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    let cancelled = false

    // Explicit .txt wins as source string; still reflow metrics via CSS only
    if (asciiProp && !hasPhoto) {
      setAscii(asciiProp)
      setReady(true)
      return
    }

    if (asciiProp && hasPhoto) {
      // Prefer sampling from photo so crop matches object-fit:cover
    }

    if (!hasPhoto) {
      setAscii(
        asciiProp ??
          placeholderAscii(metrics.cols, metrics.rows, alt.length),
      )
      setReady(true)
      return
    }

    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (cancelled) return
      try {
        setAscii(
          imageToAscii(img, {
            cols: metrics.cols,
            rows: metrics.rows,
            fit: 'cover',
          }),
        )
        setFailed(false)
        setReady(true)
      } catch {
        setFailed(true)
        setAscii(placeholderAscii(metrics.cols, metrics.rows, alt.length))
        setReady(true)
      }
    }
    img.onerror = () => {
      if (cancelled) return
      setFailed(true)
      setAscii(
        asciiProp ??
          placeholderAscii(metrics.cols, metrics.rows, alt.length),
      )
      setReady(true)
    }
    img.src = src!

    return () => {
      cancelled = true
    }
  }, [alt.length, asciiProp, hasPhoto, metrics.cols, metrics.rows, src])

  const interactive = hasPhoto && !failed

  return (
    <figure
      ref={frameRef}
      className={cn('portal-ascii-image', className)}
      data-static={interactive ? undefined : ''}
      data-failed={failed ? 'true' : undefined}
      data-touched={interactive && touched ? 'true' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={
        {
          aspectRatio: aspect,
          '--ascii-fs': `${metrics.fontSize}px`,
          '--ascii-lh': `${metrics.lineHeight}px`,
        } as React.CSSProperties
      }
      onPointerUp={(e) => {
        if (!interactive) return
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
          setTouched((v) => !v)
        }
      }}
    >
      {hasPhoto && (
        // eslint-disable-next-line @next/next/no-img-element -- paired with canvas ASCII sampling
        <img
          src={src!}
          alt={alt}
          className="portal-ascii-image-photo"
          draggable={false}
        />
      )}

      <pre
        aria-hidden={hasPhoto ? true : undefined}
        className="portal-ascii-image-glyphs"
        style={{ opacity: ready ? undefined : 0.25 }}
      >
        {ascii || '········'}
      </pre>

      {!hasPhoto && <span className="sr-only">{alt}</span>}
    </figure>
  )
}

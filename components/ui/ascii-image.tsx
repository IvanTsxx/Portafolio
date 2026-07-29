'use client'

import * as React from 'react'
import { imageToAscii } from '@/lib/ascii/image-to-ascii'
import { cn } from '@/lib/utils'

export type AsciiImageProps = {
  alt: string
  /** Photo — hover reveals from ASCII resting state. Required unless `ascii` is set. */
  src?: string | null
  /** Precomputed ASCII (.txt). Alone = static frame; with src = optional override (sampling preferred). */
  ascii?: string | null
  className?: string
  /** Aspect ratio CSS value — locked frame for ASCII + photo */
  aspect?: string
}

type FrameMetrics = {
  cols: number
  rows: number
  fontSize: number
  lineHeight: number
}

/** Mono advance ≈ 0.6em for Geist Mono / ui-monospace */
const MONO_ADVANCE = 0.6

function metricsFromBox(width: number, height: number): FrameMetrics {
  const cols = Math.max(18, Math.round(width / 7))
  const rows = Math.max(12, Math.round(height / 8))
  return {
    cols,
    rows,
    fontSize: width / (cols * MONO_ADVANCE),
    lineHeight: height / rows,
  }
}

/**
 * Fixed aspect frame. With `src`: ASCII resting → photo on hover.
 * With only `ascii`: static glyphs. No invented placeholders.
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

    if (!hasPhoto) {
      setAscii(asciiProp ?? '')
      setReady(Boolean(asciiProp))
      setFailed(false)
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
        setAscii(asciiProp ?? '')
        setReady(Boolean(asciiProp))
      }
    }
    img.onerror = () => {
      if (cancelled) return
      setFailed(true)
      setAscii(asciiProp ?? '')
      setReady(Boolean(asciiProp))
    }
    img.src = src!

    return () => {
      cancelled = true
    }
  }, [asciiProp, hasPhoto, metrics.cols, metrics.rows, src])

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
        {ascii}
      </pre>

      {!hasPhoto && <span className="sr-only">{alt}</span>}
    </figure>
  )
}

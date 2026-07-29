'use client'

import * as React from 'react'
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react'
import { dissolveAscii } from '@/lib/ascii/dissolve'
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
  /**
   * `card` — bordered lab still. `field` — borderless knockout portrait over the cosmos.
   */
  variant?: 'card' | 'field'
  /**
   * Glyph density. `mark` = small logos (work). `fine` = hero/about portraits.
   */
  grain?: 'default' | 'fine' | 'mark'
  /**
   * Controlled reveal — parent hover (e.g. work row). When set, ignores own hover.
   */
  reveal?: boolean
  /**
   * No tabIndex / own pointer handlers — for use inside links.
   */
  passive?: boolean
}

type FrameMetrics = {
  cols: number
  rows: number
  fontSize: number
  lineHeight: number
}

/** Mono advance ≈ 0.6em for Geist Mono / ui-monospace */
const MONO_ADVANCE = 0.6
const DISSOLVE_EASE = [0.22, 1, 0.36, 1] as const

function metricsFromBox(
  width: number,
  height: number,
  grain: 'default' | 'fine' | 'mark' = 'default',
): FrameMetrics {
  const cellW = grain === 'mark' ? 3.2 : grain === 'fine' ? 4.75 : 7
  const cellH = grain === 'mark' ? 3.5 : grain === 'fine' ? 5.5 : 8
  const minCols = grain === 'mark' ? 10 : grain === 'fine' ? 28 : 18
  const minRows = grain === 'mark' ? 10 : grain === 'fine' ? 22 : 12
  const cols = Math.max(minCols, Math.round(width / cellW))
  const rows = Math.max(minRows, Math.round(height / cellH))
  return {
    cols,
    rows,
    fontSize: width / (cols * MONO_ADVANCE),
    lineHeight: height / rows,
  }
}

/**
 * Fixed aspect frame. With `src`: ASCII resting → photo via minimal matrix dissolve.
 * With only `ascii`: static glyphs. No invented placeholders.
 */
export function AsciiImage({
  alt,
  src = null,
  ascii: asciiProp = null,
  className,
  aspect = '4 / 3',
  variant = 'card',
  grain: grainProp,
  reveal: revealProp,
  passive = false,
}: AsciiImageProps) {
  const hasPhoto = Boolean(src)
  const field = variant === 'field'
  const grain = grainProp ?? (field ? 'fine' : 'default')
  const prefersReduced = useReducedMotion()
  const frameRef = React.useRef<HTMLElement>(null)
  const glyphsRef = React.useRef<HTMLPreElement>(null)
  const photoRef = React.useRef<HTMLImageElement>(null)
  const sourceRef = React.useRef('')
  const progress = useMotionValue(0)

  const [metrics, setMetrics] = React.useState<FrameMetrics>(() =>
    metricsFromBox(grain === 'mark' ? 48 : 280, grain === 'mark' ? 48 : 210, grain),
  )
  const [ascii, setAscii] = React.useState(asciiProp ?? '')
  const [ready, setReady] = React.useState(Boolean(asciiProp))
  const [failed, setFailed] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const [hot, setHot] = React.useState(false)

  const canDissolve = hasPhoto && !failed
  const ownsPointer = canDissolve && !passive && revealProp === undefined
  const revealed =
    canDissolve &&
    (revealProp !== undefined ? revealProp : hot || touched)
  const seed = metrics.cols * 997 + metrics.rows

  React.useEffect(() => {
    sourceRef.current = ascii
    if (glyphsRef.current && progress.get() < 0.001) {
      glyphsRef.current.textContent = ascii
    }
  }, [ascii, progress])

  React.useEffect(() => {
    const el = frameRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (!box || box.width < 8 || box.height < 8) return
      const next = metricsFromBox(box.width, box.height, grain)
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
  }, [grain])

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
            fit: grain === 'mark' ? 'fill' : 'cover',
            knockout: field ? 0.11 : undefined,
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
  }, [asciiProp, field, grain, hasPhoto, metrics.cols, metrics.rows, src])

  useMotionValueEvent(progress, 'change', (v) => {
    const source = sourceRef.current
    if (!source) return

    if (glyphsRef.current) {
      glyphsRef.current.textContent =
        prefersReduced || v <= 0.001
          ? source
          : v >= 0.999
            ? source.replace(/[^\n]/g, ' ')
            : dissolveAscii(source, v, seed)
    }

    if (photoRef.current) {
      const o = prefersReduced
        ? v > 0.5
          ? 1
          : 0
        : Math.min(1, Math.max(0, (v - 0.08) / 0.72))
      photoRef.current.style.opacity = String(o)
    }
  })

  React.useEffect(() => {
    if (!canDissolve) return

    if (prefersReduced) {
      progress.set(revealed ? 1 : 0)
      return
    }

    const controls = animate(progress, revealed ? 1 : 0, {
      duration: revealed ? 0.72 : 0.55,
      ease: DISSOLVE_EASE,
    })
    return () => controls.stop()
  }, [canDissolve, prefersReduced, progress, revealed])

  return (
    <figure
      ref={frameRef}
      className={cn('portal-ascii-image', className)}
      data-variant={variant}
      data-grain={grain}
      data-static={canDissolve ? undefined : ''}
      data-failed={failed ? 'true' : undefined}
      data-dissolve={canDissolve ? '' : undefined}
      tabIndex={ownsPointer ? 0 : undefined}
      style={
        {
          aspectRatio: aspect,
          '--ascii-fs': `${metrics.fontSize}px`,
          '--ascii-lh': `${metrics.lineHeight}px`,
        } as React.CSSProperties
      }
      onPointerEnter={() => {
        if (ownsPointer) setHot(true)
      }}
      onPointerLeave={() => {
        if (ownsPointer) setHot(false)
      }}
      onFocus={() => {
        if (ownsPointer) setHot(true)
      }}
      onBlur={() => {
        if (ownsPointer) setHot(false)
      }}
      onPointerUp={(e) => {
        if (!ownsPointer) return
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
          setTouched((v) => !v)
        }
      }}
    >
      {hasPhoto && (
        // eslint-disable-next-line @next/next/no-img-element -- paired with canvas ASCII sampling
        <img
          ref={photoRef}
          src={src!}
          alt={alt}
          className="portal-ascii-image-photo"
          draggable={false}
        />
      )}

      <pre
        ref={glyphsRef}
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

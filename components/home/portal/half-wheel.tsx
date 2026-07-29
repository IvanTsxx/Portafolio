'use client'

import * as React from 'react'
import { DESTINATIONS, type DestId } from './content'
import { portal } from '@/lib/portal/styles'

function destProgress(id: DestId): number {
  const i = DESTINATIONS.findIndex((d) => d.id === id)
  const n = DESTINATIONS.length
  // `open` is not a spoke — pin rests at home
  if (i < 0) return 0
  return n <= 1 ? 0.5 : i / (n - 1)
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = { x: cx + Math.cos(a0) * r, y: cy - Math.sin(a0) * r }
  const p1 = { x: cx + Math.cos(a1) * r, y: cy - Math.sin(a1) * r }
  const delta = Math.abs(a0 - a1)
  const large = delta > Math.PI ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * Pin (orange) fills only to active.
 * Hover (bright) is a separate soft fill.
 * Both lerp — grow and shrink smoothly.
 */
export function HalfWheel({
  active,
  hover,
  chargeRef,
  onHover,
  onHoldStart,
  onHoldEnd,
  disabled,
}: {
  active: DestId
  hover: DestId
  chargeRef: React.MutableRefObject<number>
  onHover: (id: DestId) => void
  onHoldStart: (id: DestId) => void
  onHoldEnd: () => void
  disabled?: boolean
}) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const pinPath = React.useRef<SVGPathElement>(null)
  const hoverPath = React.useRef<SVGPathElement>(null)
  const chargePath = React.useRef<SVGPathElement>(null)
  const hubLabel = React.useRef<SVGTextElement>(null)
  const pinDisplay = React.useRef(destProgress(active))
  const hoverDisplay = React.useRef(destProgress(hover))
  const pinTarget = React.useRef(destProgress(active))
  const hoverTarget = React.useRef(destProgress(hover))
  const holding = React.useRef(false)
  const onArcRef = React.useRef(false)
  const [hot, setHot] = React.useState(false)
  const n = DESTINATIONS.length
  /** Mid size — smaller than original, bigger than last pass; cx = vbW/2 for true center */
  const radius = 124
  const vbW = 400
  const cx = vbW / 2
  const labelR = radius + 20
  const cy = labelR + 6
  const vbH = cy + 28
  const band = 16
  const tickInner = radius - 11
  const hubR = 22
  const caretR = 5.5

  const pinT = destProgress(active)

  React.useEffect(() => {
    pinTarget.current = destProgress(active)
  }, [active])

  React.useEffect(() => {
    hoverTarget.current = destProgress(hover)
  }, [hover])

  const idAtProgress = React.useCallback(
    (t: number): DestId => {
      const idx = Math.round(Math.max(0, Math.min(1, t)) * (n - 1))
      return DESTINATIONS[idx]!.id
    },
    [n],
  )

  const sample = React.useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return null
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      const ctm = svg.getScreenCTM()
      if (!ctm) return null
      const local = pt.matrixTransform(ctm.inverse())
      const dx = local.x - cx
      const dy = cy - local.y
      const dist = Math.hypot(dx, dy)
      const onArc = dist > radius - band && dist < radius + band && dy >= -4
      let ang = Math.atan2(dy, dx)
      if (ang < 0) ang = 0
      if (ang > Math.PI) ang = Math.PI
      return { t: 1 - ang / Math.PI, onArc }
    },
    [band, radius],
  )

  // Smooth pin + hover fills + charge paint
  React.useEffect(() => {
    let raf = 0
    let lastCharge = -1
    const tick = () => {
      const ease = 0.14
      pinDisplay.current = lerp(pinDisplay.current, pinTarget.current, ease)
      hoverDisplay.current = lerp(hoverDisplay.current, hoverTarget.current, ease)

      if (Math.abs(pinDisplay.current - pinTarget.current) < 0.001) {
        pinDisplay.current = pinTarget.current
      }
      if (Math.abs(hoverDisplay.current - hoverTarget.current) < 0.001) {
        hoverDisplay.current = hoverTarget.current
      }

      const pPin = Math.max(pinDisplay.current, 0.001)
      const pHover = Math.max(hoverDisplay.current, 0.001)

      if (pinPath.current) {
        pinPath.current.setAttribute(
          'd',
          arcPath(cx, cy, radius, Math.PI, Math.PI - pPin * Math.PI),
        )
      }
      if (hoverPath.current) {
        hoverPath.current.setAttribute(
          'd',
          arcPath(cx, cy, radius, Math.PI, Math.PI - pHover * Math.PI),
        )
        // Hide hover stroke when it matches pin (avoid double-draw)
        const overlap = Math.abs(pHover - pPin) < 0.02
        hoverPath.current.style.opacity = overlap ? '0' : '1'
      }

      const c = chargeRef.current
      if (Math.abs(c - lastCharge) > 0.008) {
        lastCharge = c
        const path = chargePath.current
        const hub = hubLabel.current
        if (path) {
          // Charge grows toward the held hover target, not full arc
          const span = Math.max(hoverDisplay.current * c, 0.001)
          path.setAttribute('d', arcPath(cx, cy, radius, Math.PI, Math.PI - span * Math.PI))
          path.style.opacity = c > 0.02 ? '1' : '0'
        }
        if (hub) hub.textContent = c > 0.05 ? `${Math.round(c * 100)}` : 'HOLD'
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [chargeRef])

  const setArcHot = (next: boolean) => {
    onArcRef.current = next
    setHot((h) => (h === next ? h : next))
  }

  const handleMove = (e: React.PointerEvent) => {
    const s = sample(e.clientX, e.clientY)
    if (!s) return
    if (s.onArc) {
      setArcHot(true)
      onHover(idAtProgress(s.t))
      return
    }
    if (onArcRef.current) {
      setArcHot(false)
      // Ease hover fill back to pin
      onHover(active)
    }
  }

  const handleDown = (e: React.PointerEvent) => {
    if (disabled) return
    const s = sample(e.clientX, e.clientY)
    if (!s?.onArc) return
    holding.current = true
    setArcHot(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    const id = idAtProgress(s.t)
    onHover(id)
    onHoldStart(id)
  }

  const handleUp = (e: React.PointerEvent) => {
    if (holding.current) {
      holding.current = false
      onHoldEnd()
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
    const s = sample(e.clientX, e.clientY)
    setArcHot(Boolean(s?.onArc))
  }

  const pinAngle = Math.PI - pinT * Math.PI

  return (
    <div className={portal.wheel} aria-label="Destination wheel">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${vbW} ${vbH}`}
        className={portal.wheelSvg}
        style={{ touchAction: 'none', userSelect: 'none', cursor: hot ? 'pointer' : 'default' }}
      >
        <path
          d={arcPath(cx, cy, radius, Math.PI, 0)}
          fill="none"
          stroke="transparent"
          strokeWidth={band * 2}
          className="portal-wheel-hit"
          onPointerMove={handleMove}
          onPointerDown={handleDown}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onPointerLeave={() => {
            if (!holding.current) {
              setArcHot(false)
              onHover(active)
            }
          }}
          onPointerEnter={() => setArcHot(true)}
        />
        <path d={arcPath(cx, cy, radius, Math.PI, 0)} className="portal-wheel-track" fill="none" />
        <path
          ref={hoverPath}
          d={arcPath(cx, cy, radius, Math.PI, Math.PI - 0.02 * Math.PI)}
          className="portal-wheel-hover"
          fill="none"
        />
        <path
          ref={pinPath}
          d={arcPath(cx, cy, radius, Math.PI, Math.PI - Math.max(pinT, 0.02) * Math.PI)}
          className="portal-wheel-pin"
          fill="none"
        />
        <path
          ref={chargePath}
          d={arcPath(cx, cy, radius, Math.PI, Math.PI)}
          className="portal-wheel-charge"
          fill="none"
          style={{ opacity: 0 }}
        />
        <circle
          cx={cx + Math.cos(pinAngle) * radius}
          cy={cy - Math.sin(pinAngle) * radius}
          r={caretR}
          className="portal-wheel-caret"
        />
        {DESTINATIONS.map((item, i) => {
          const t = n === 1 ? 0.5 : i / (n - 1)
          const angle = Math.PI - t * Math.PI
          const x = cx + Math.cos(angle) * radius
          const y = cy - Math.sin(angle) * radius
          const isActive = active === item.id
          return (
            <g key={item.id}>
              <line
                x1={x}
                y1={y}
                x2={cx + Math.cos(angle) * tickInner}
                y2={cy - Math.sin(angle) * tickInner}
                className="portal-wheel-tick"
                data-active={isActive ? '' : undefined}
              />
              <circle
                cx={x}
                cy={y}
                r={isActive ? 3.5 : 2.5}
                className="portal-wheel-dot"
                data-active={isActive ? '' : undefined}
              />
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={hubR} className="portal-wheel-hub" />
        <text
          ref={hubLabel}
          x={cx}
          y={cy + 3}
          textAnchor="middle"
          className="portal-wheel-hub-label"
          style={{ userSelect: 'none' }}
        >
          HOLD
        </text>
        {DESTINATIONS.map((item, i) => {
          const t = n === 1 ? 0.5 : i / (n - 1)
          const angle = Math.PI - t * Math.PI
          return (
            <text
              key={`l-${item.id}`}
              x={cx + Math.cos(angle) * labelR}
              y={cy - Math.sin(angle) * labelR}
              textAnchor="middle"
              dominantBaseline="middle"
              className="portal-wheel-svg-label"
              data-active={active === item.id ? '' : undefined}
              style={{ userSelect: 'none' }}
            >
              {item.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

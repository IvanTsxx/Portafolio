'use client'

import * as React from 'react'
import { DESTINATIONS, type DestId } from './content'

function destProgress(id: DestId): number {
  const i = DESTINATIONS.findIndex((d) => d.id === id)
  const n = DESTINATIONS.length
  return n <= 1 ? 0.5 : Math.max(0, i) / (n - 1)
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = { x: cx + Math.cos(a0) * r, y: cy - Math.sin(a0) * r }
  const p1 = { x: cx + Math.cos(a1) * r, y: cy - Math.sin(a1) * r }
  const delta = Math.abs(a0 - a1)
  const large = delta > Math.PI ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`
}

/** Pin = active. Fill = hover. Charge painted from ref (no parent re-render). */
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
  const chargePath = React.useRef<SVGPathElement>(null)
  const hubLabel = React.useRef<SVGTextElement>(null)
  const holding = React.useRef(false)
  const onArcRef = React.useRef(false)
  const [hot, setHot] = React.useState(false)
  const n = DESTINATIONS.length
  const radius = 152
  const cx = 200
  const cy = 198
  const vbH = 215
  const band = 18

  const pinT = destProgress(active)
  const fillT = Math.max(destProgress(hover), 0.02)

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

  // Paint charge from ref — isolates hold animation from React tree
  React.useEffect(() => {
    let raf = 0
    let last = -1
    const tick = () => {
      const c = chargeRef.current
      if (Math.abs(c - last) > 0.01) {
        last = c
        const path = chargePath.current
        const hub = hubLabel.current
        if (path) {
          path.setAttribute('d', arcPath(cx, cy, radius, Math.PI, Math.PI - Math.max(c, 0.001) * Math.PI))
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
    if (onArcRef.current) setArcHot(false)
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
    <div className="portal-wheel" aria-label="Destination wheel">
      <svg
        ref={svgRef}
        viewBox={`0 0 400 ${vbH}`}
        className="portal-wheel-svg"
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
            if (!holding.current) setArcHot(false)
          }}
          onPointerEnter={() => setArcHot(true)}
        />
        <path d={arcPath(cx, cy, radius, Math.PI, 0)} className="portal-wheel-track" fill="none" />
        <path
          d={arcPath(cx, cy, radius, Math.PI, Math.PI - fillT * Math.PI)}
          className="portal-wheel-progress"
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
          r={6}
          className="portal-wheel-caret"
        />
        {DESTINATIONS.map((item, i) => {
          const t = n === 1 ? 0.5 : i / (n - 1)
          const angle = Math.PI - t * Math.PI
          const x = cx + Math.cos(angle) * radius
          const y = cy - Math.sin(angle) * radius
          const isActive = active === item.id
          const inner = radius - 14
          return (
            <g key={item.id}>
              <line
                x1={x}
                y1={y}
                x2={cx + Math.cos(angle) * inner}
                y2={cy - Math.sin(angle) * inner}
                className="portal-wheel-tick"
                data-active={isActive ? '' : undefined}
              />
              <circle
                cx={x}
                cy={y}
                r={isActive ? 4.5 : 3}
                className="portal-wheel-dot"
                data-active={isActive ? '' : undefined}
              />
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={26} className="portal-wheel-hub" />
        <text
          ref={hubLabel}
          x={cx}
          y={cy + 4}
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
              x={cx + Math.cos(angle) * (radius + 22)}
              y={cy - Math.sin(angle) * (radius + 22)}
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

// components/mdx/cache-life-profiles.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Locale = 'en' | 'es'

interface Profile {
  name: string
  stale: string
  revalidate: string
  expire: string
  useCase: string
  /** Relative weights for the mini timeline (stale / revalidate / expire segment). */
  weights: [number, number, number]
}

interface LocaleData {
  columns: string[]
  profiles: Profile[]
}

const localeData: Record<Locale, LocaleData> = {
  en: {
    columns: ['Profile', 'stale', 'revalidate', 'expire', 'When to use'],
    profiles: [
      {
        expire: 'Never',
        name: 'default',
        revalidate: '15 min',
        stale: '5 min',
        useCase: "General use when you don't specify anything",
        weights: [5, 15, 40],
      },
      {
        expire: '15 min',
        name: 'minutes',
        revalidate: '5 min',
        stale: '1 min',
        useCase: 'Frequently changing data',
        weights: [1, 5, 9],
      },
      {
        expire: '4 hours',
        name: 'hours',
        revalidate: '1 hour',
        stale: '5 min',
        useCase: 'Stats, metrics, feeds',
        weights: [5, 60, 180],
      },
      {
        expire: '3 days',
        name: 'days',
        revalidate: '1 day',
        stale: '5 min',
        useCase: 'Posts, products, content pages',
        weights: [5, 1440, 2880],
      },
      {
        expire: '1 month',
        name: 'weeks',
        revalidate: '1 week',
        stale: '5 min',
        useCase: 'Sponsors, rarely modified data',
        weights: [5, 10080, 30000],
      },
      {
        expire: '1 year',
        name: 'max',
        revalidate: '1 year',
        stale: '30 days',
        useCase: 'Static assets, immutable data',
        weights: [30, 335, 0],
      },
    ],
  },
  es: {
    columns: ['Perfil', 'stale', 'revalidate', 'expire', 'Cuándo usar'],
    profiles: [
      {
        expire: 'Nunca',
        name: 'default',
        revalidate: '15 min',
        stale: '5 min',
        useCase: 'Uso general cuando no especificas nada',
        weights: [5, 15, 40],
      },
      {
        expire: '15 min',
        name: 'minutes',
        revalidate: '5 min',
        stale: '1 min',
        useCase: 'Datos que cambian con frecuencia',
        weights: [1, 5, 9],
      },
      {
        expire: '4 horas',
        name: 'hours',
        revalidate: '1 hora',
        stale: '5 min',
        useCase: 'Estadísticas, métricas, feeds',
        weights: [5, 60, 180],
      },
      {
        expire: '3 días',
        name: 'days',
        revalidate: '1 día',
        stale: '5 min',
        useCase: 'Posts, productos, páginas de contenido',
        weights: [5, 1440, 2880],
      },
      {
        expire: '1 mes',
        name: 'weeks',
        revalidate: '1 semana',
        stale: '5 min',
        useCase: 'Sponsors, datos que rara vez cambian',
        weights: [5, 10080, 30000],
      },
      {
        expire: '1 año',
        name: 'max',
        revalidate: '1 año',
        stale: '30 días',
        useCase: 'Assets estáticos, datos inmutables',
        weights: [30, 335, 0],
      },
    ],
  },
}

const RAIL_W = 120
const RAIL_H = 8

function ProfileRail({ weights, label }: { weights: [number, number, number]; label: string }) {
  const total = Math.max(weights[0] + weights[1] + weights[2], 1)
  const staleW = (weights[0] / total) * RAIL_W
  const revalW = (weights[1] / total) * RAIL_W
  const expireW = RAIL_W - staleW - revalW

  return (
    <svg
      viewBox={`0 0 ${RAIL_W} ${RAIL_H}`}
      width={RAIL_W}
      height={RAIL_H}
      className="cache-life-rail"
      role="img"
      aria-label={label}
    >
      <rect className="cache-life-rail-track" x="0" y="2" width={RAIL_W} height="4" />
      <rect className="cache-life-rail-stale" x="0" y="2" width={staleW} height="4" />
      <rect
        className="cache-life-rail-revalidate"
        x={staleW}
        y="2"
        width={Math.max(revalW, 0)}
        height="4"
      />
      {expireW > 0.5 ? (
        <rect
          className="cache-life-rail-expire"
          x={staleW + revalW}
          y="2"
          width={expireW}
          height="4"
        />
      ) : null}
    </svg>
  )
}

export interface CacheLifeProfilesProps {
  locale: Locale
}

export function CacheLifeProfiles({ locale }: CacheLifeProfilesProps) {
  const { columns, profiles } = localeData[locale]
  const rootRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={rootRef}
      data-animating={inView ? '' : undefined}
      className={cn(
        'cache-life-profiles not-typeset my-6 overflow-x-auto',
        'border border-p-bright/14 bg-p-bright/4',
        '[text-shadow:0_0_12px_var(--color-p-void)]',
      )}
    >
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-p-bright/14">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-p-dim"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profiles.map((p, i) => (
            <tr
              key={p.name}
              className={cn(
                'border-b border-p-bright/10',
                i % 2 === 0 ? 'bg-transparent' : 'bg-p-bright/3',
              )}
            >
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1.5">
                  <code className="w-fit border border-p-bright/14 bg-p-bright/8 px-1.5 py-0.5 font-mono text-2xs text-p-bright">
                    &apos;{p.name}&apos;
                  </code>
                  <ProfileRail
                    weights={p.weights}
                    label={`${p.name}: stale ${p.stale}, revalidate ${p.revalidate}, expire ${p.expire}`}
                  />
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-2xs text-p-mid">{p.stale}</td>
              <td className="px-4 py-3 font-mono text-2xs text-p-mid">{p.revalidate}</td>
              <td className="px-4 py-3 font-mono text-2xs text-p-mid">{p.expire}</td>
              <td className="px-4 py-3 text-[14px] text-p-mid">{p.useCase}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

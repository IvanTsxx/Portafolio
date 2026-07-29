// components/mdx/content-types-table.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { portal } from '@/lib/portal/styles'

type Locale = 'en' | 'es'
type ContentKind = 'static' | 'cached' | 'dynamic'

interface ContentType {
  type: ContentKind
  label: string
  description: string
  directive: string
  servedFrom: string
  examples: string[]
  badge: string
  railLabel: string
}

interface LocaleData {
  directiveLabel: string
  servedFromLabel: string
  examplesLabel: string
  types: ContentType[]
}

const localeData: Record<Locale, LocaleData> = {
  en: {
    directiveLabel: 'Directive',
    examplesLabel: 'Examples',
    servedFromLabel: 'Served from',
    types: [
      {
        badge: 'Instant',
        description:
          'Synchronous code, imports, JSX without async. Pre-rendered at build time and served instantly from the CDN.',
        directive: 'no directive',
        examples: ['Headers', 'Navbars', 'Footers', 'Static text'],
        label: 'Static',
        railLabel: 'build → CDN → client',
        servedFrom: 'CDN (build time)',
        type: 'static',
      },
      {
        badge: 'Configurable',
        description:
          "Async data that doesn't need to be fresh on every request. Cached on first render and revalidated according to the configured cacheLife.",
        directive: "'use cache'",
        examples: ['Post lists', 'Global stats', 'Products', 'Categories'],
        label: 'Cached',
        railLabel: 'request → cache → client',
        servedFrom: 'Cache (server / CDN)',
        type: 'cached',
      },
      {
        badge: 'Always fresh',
        description:
          'Data that must be fresh on every request. Accesses cookies, headers, or searchParams. Must be wrapped in Suspense.',
        directive: '<Suspense>',
        examples: ['User data', 'Notifications', 'Shopping cart', 'Preferences'],
        label: 'Dynamic',
        railLabel: 'request → server → stream',
        servedFrom: 'Server (every request)',
        type: 'dynamic',
      },
    ],
  },
  es: {
    directiveLabel: 'Directiva',
    examplesLabel: 'Ejemplos',
    servedFromLabel: 'Servido desde',
    types: [
      {
        badge: 'Instantáneo',
        description:
          'Código síncrono, imports, JSX sin async. Se pre-renderiza en build time y se sirve desde el CDN instantáneamente.',
        directive: 'sin directiva',
        examples: ['Headers', 'Navbars', 'Footers', 'Texto estático'],
        label: 'Estático',
        railLabel: 'build → CDN → cliente',
        servedFrom: 'CDN (build time)',
        type: 'static',
      },
      {
        badge: 'Configurable',
        description:
          'Datos async que no necesitan ser frescos en cada request. Se cachean en el primer render y se revalidan según el cacheLife configurado.',
        directive: "'use cache'",
        examples: ['Listas de posts', 'Stats globales', 'Productos', 'Categorías'],
        label: 'Cacheado',
        railLabel: 'request → cache → cliente',
        servedFrom: 'Cache (servidor / CDN)',
        type: 'cached',
      },
      {
        badge: 'Siempre fresco',
        description:
          'Datos que deben ser frescos en cada request. Acceden a cookies, headers o searchParams. Deben envolverse en Suspense.',
        directive: '<Suspense>',
        examples: ['Datos del usuario', 'Notificaciones', 'Carrito de compras', 'Preferencias'],
        label: 'Dinámico',
        railLabel: 'request → servidor → stream',
        servedFrom: 'Servidor (cada request)',
        type: 'dynamic',
      },
    ],
  },
}

function ServeRail({ kind, label }: { kind: ContentKind; label: string }) {
  return (
    <svg
      viewBox="0 0 280 44"
      xmlns="http://www.w3.org/2000/svg"
      className="content-type-rail w-full"
      role="img"
      aria-label={label}
    >
      <line className="content-type-track" x1="16" y1="22" x2="264" y2="22" strokeWidth="1.5" />

      {kind === 'static' ? (
        <>
          <line
            className="content-type-fill content-type-fill-static"
            x1="16"
            y1="22"
            x2="264"
            y2="22"
            strokeWidth="1.5"
            pathLength={100}
          />
          <circle className="content-type-node" cx="16" cy="22" r="4" />
          <circle className="content-type-node-end" cx="140" cy="22" r="4" />
          <circle className="content-type-node-end" cx="264" cy="22" r="4" />
          <text className="content-type-rail-label" x="16" y="40" fontSize="8" fontFamily="ui-monospace, monospace">
            build
          </text>
          <text
            className="content-type-rail-label"
            x="140"
            y="40"
            textAnchor="middle"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            CDN
          </text>
          <text
            className="content-type-rail-label"
            x="264"
            y="40"
            textAnchor="end"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            client
          </text>
        </>
      ) : null}

      {kind === 'cached' ? (
        <>
          <line
            className="content-type-fill content-type-fill-cached"
            x1="16"
            y1="22"
            x2="264"
            y2="22"
            strokeWidth="1.5"
            pathLength={100}
          />
          <path
            className="content-type-loop"
            d="M140 18 Q140 6 118 6 Q96 6 96 18"
            fill="none"
            strokeWidth="1.1"
            strokeDasharray="3 2"
          />
          <circle className="content-type-node" cx="16" cy="22" r="4" />
          <circle className="content-type-node-cache" cx="140" cy="22" r="5" />
          <circle className="content-type-token content-type-token-cached" cx="16" cy="22" r="3.5" />
          <circle className="content-type-node-end" cx="264" cy="22" r="4" />
          <text className="content-type-rail-label" x="16" y="40" fontSize="8" fontFamily="ui-monospace, monospace">
            req
          </text>
          <text
            className="content-type-rail-label"
            x="140"
            y="40"
            textAnchor="middle"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            cache
          </text>
          <text
            className="content-type-rail-label"
            x="264"
            y="40"
            textAnchor="end"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            client
          </text>
        </>
      ) : null}

      {kind === 'dynamic' ? (
        <>
          <line
            className="content-type-fill content-type-fill-dynamic"
            x1="16"
            y1="22"
            x2="264"
            y2="22"
            strokeWidth="1.5"
            pathLength={100}
          />
          <circle className="content-type-node" cx="16" cy="22" r="4" />
          <circle className="content-type-node-end" cx="140" cy="22" r="4" />
          <circle className="content-type-token content-type-token-dynamic" cx="16" cy="22" r="3.5" />
          <circle className="content-type-node-end" cx="264" cy="22" r="4" />
          <text className="content-type-rail-label" x="16" y="40" fontSize="8" fontFamily="ui-monospace, monospace">
            req
          </text>
          <text
            className="content-type-rail-label"
            x="140"
            y="40"
            textAnchor="middle"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            server
          </text>
          <text
            className="content-type-rail-label"
            x="264"
            y="40"
            textAnchor="end"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            stream
          </text>
        </>
      ) : null}
    </svg>
  )
}

export interface ContentTypesTableProps {
  locale: Locale
}

export function ContentTypesTable({ locale }: ContentTypesTableProps) {
  const { types, directiveLabel, servedFromLabel, examplesLabel } = localeData[locale]
  const rootRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={rootRef}
      data-animating={inView ? '' : undefined}
      className="content-types not-typeset my-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {types.map((item) => (
        <article
          key={item.type}
          data-kind={item.type}
          className={cn(
            'content-type-card flex flex-col gap-3 border border-p-bright/14 bg-p-bright/4 p-4',
            '[text-shadow:0_0_12px_var(--color-p-void)]',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-[14px] font-semibold text-p-bright">{item.label}</span>
            <span
              className={cn(
                'shrink-0 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]',
                item.type === 'cached'
                  ? 'border-p-signal/40 bg-p-signal/12 text-p-signal'
                  : 'border-p-bright/20 bg-p-bright/6 text-p-dim',
              )}
            >
              {item.badge}
            </span>
          </div>

          <ServeRail kind={item.type} label={item.railLabel} />

          <p className="text-[14px] leading-relaxed text-p-mid">{item.description}</p>

          <div className="space-y-1">
            <p className={portal.label}>{directiveLabel}</p>
            <code className="inline-block border border-p-bright/14 bg-p-bright/8 px-1.5 py-0.5 font-mono text-2xs text-p-bright">
              {item.directive}
            </code>
          </div>

          <div className="space-y-1">
            <p className={portal.label}>{servedFromLabel}</p>
            <p className="text-[14px] text-p-bright/85">{item.servedFrom}</p>
          </div>

          <div className="mt-auto space-y-1.5">
            <p className={portal.label}>{examplesLabel}</p>
            <div className="flex flex-wrap gap-1">
              {item.examples.map((ex) => (
                <span
                  key={ex}
                  className="border border-p-bright/12 bg-p-bright/5 px-1.5 py-0.5 font-mono text-[9px] text-p-mid"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

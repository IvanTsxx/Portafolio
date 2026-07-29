// components/mdx/invalidation-compare.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { portal } from '@/lib/portal/styles'

type Locale = 'en' | 'es'
type Consistency = 'eventual' | 'strong'

interface Method {
  name: string
  import: string
  timing: string
  behavior: string
  consistency: Consistency
  useWhen: string[]
  railLabel: string
}

interface LocaleData {
  consistencyLabel: string
  strongConsistencyText: string
  eventualConsistencyText: string
  useWhenLabel: string
  methods: Method[]
}

const localeData: Record<Locale, LocaleData> = {
  en: {
    consistencyLabel: 'Consistency',
    eventualConsistencyText: 'eventual',
    methods: [
      {
        behavior:
          'Marks the entry as stale. The next request triggers a background fetch and serves the previous value meanwhile.',
        consistency: 'eventual',
        import: "import { revalidateTag } from 'next/cache'",
        name: 'revalidateTag()',
        railLabel: 'stale serve → background fetch → swap',
        timing: 'Background',
        useWhen: [
          "You create or update a resource and it's fine for the user to see the previous version for one more request",
          'High-frequency operations where blocking would be expensive',
          'Most common cases',
        ],
      },
      {
        behavior:
          'Invalidates the cache entry synchronously. The same request (and all following) will see the new value. No inconsistency window.',
        consistency: 'strong',
        import: "import { updateTag } from 'next/cache'",
        name: 'updateTag()',
        railLabel: 'invalidate → block → fresh value',
        timing: 'Immediate',
        useWhen: [
          'The user just modified data and needs to see the result immediately',
          'Flows where showing the previous value would be a critical UX error',
          'Critical operations: delete, publish, status changes',
        ],
      },
    ],
    strongConsistencyText: 'strong',
    useWhenLabel: 'Use it when',
  },
  es: {
    consistencyLabel: 'Consistencia',
    eventualConsistencyText: 'eventual',
    methods: [
      {
        behavior:
          'Marca la entrada como stale. El siguiente request que llegue después lanza un fetch en background y sirve el valor anterior mientras tanto.',
        consistency: 'eventual',
        import: "import { revalidateTag } from 'next/cache'",
        name: 'revalidateTag()',
        railLabel: 'serve stale → fetch background → swap',
        timing: 'Background',
        useWhen: [
          'Creás o actualizás un recurso y está bien que el usuario vea la versión anterior por un request más',
          'Operaciones de alta frecuencia donde el bloqueo sería costoso',
          'La mayoría de los casos',
        ],
      },
      {
        behavior:
          'Invalida la entrada de caché de forma síncrona. El mismo request (y todos los siguientes) ya verán el nuevo valor. No hay ventana de inconsistencia.',
        consistency: 'strong',
        import: "import { updateTag } from 'next/cache'",
        name: 'updateTag()',
        railLabel: 'invalidar → bloquear → valor fresco',
        timing: 'Inmediato',
        useWhen: [
          'El usuario acaba de modificar un dato y debe ver el resultado de inmediato',
          'Flujos donde mostrar el valor anterior sería un error de UX grave',
          'Operaciones críticas: delete, publish, status changes',
        ],
      },
    ],
    strongConsistencyText: 'fuerte',
    useWhenLabel: 'Usalo cuando',
  },
}

function InvalidationRail({
  kind,
  label,
}: {
  kind: Consistency
  label: string
}) {
  return (
    <svg
      viewBox="0 0 280 40"
      xmlns="http://www.w3.org/2000/svg"
      className="invalidation-rail w-full"
      role="img"
      aria-label={label}
    >
      <line className="invalidation-track" x1="16" y1="18" x2="264" y2="18" strokeWidth="1.5" />

      {kind === 'eventual' ? (
        <>
          <line
            className="invalidation-fill invalidation-fill-eventual"
            x1="16"
            y1="18"
            x2="264"
            y2="18"
            strokeWidth="1.5"
            pathLength={100}
          />
          <path
            className="invalidation-loop"
            d="M150 14 Q150 4 128 4 Q106 4 106 14"
            fill="none"
            strokeWidth="1.1"
            strokeDasharray="3 2"
          />
          <circle className="invalidation-node" cx="16" cy="18" r="4" />
          <circle className="invalidation-node-mid" cx="150" cy="18" r="4.5" />
          <circle className="invalidation-token invalidation-token-eventual" cx="16" cy="18" r="3.5" />
          <circle className="invalidation-node-end" cx="264" cy="18" r="4" />
          <text className="invalidation-label" x="16" y="34" fontSize="8" fontFamily="ui-monospace, monospace">
            stale
          </text>
          <text
            className="invalidation-label"
            x="150"
            y="34"
            textAnchor="middle"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            bg fetch
          </text>
          <text
            className="invalidation-label"
            x="264"
            y="34"
            textAnchor="end"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            swap
          </text>
        </>
      ) : (
        <>
          <line
            className="invalidation-fill invalidation-fill-strong"
            x1="16"
            y1="18"
            x2="264"
            y2="18"
            strokeWidth="1.5"
            pathLength={100}
          />
          <line
            className="invalidation-cut"
            x1="140"
            y1="8"
            x2="140"
            y2="28"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          <circle className="invalidation-node" cx="16" cy="18" r="4" />
          <circle className="invalidation-node-end" cx="140" cy="18" r="4" />
          <circle className="invalidation-token invalidation-token-strong" cx="16" cy="18" r="3.5" />
          <circle className="invalidation-node-end" cx="264" cy="18" r="4" />
          <text className="invalidation-label" x="16" y="34" fontSize="8" fontFamily="ui-monospace, monospace">
            invalidate
          </text>
          <text
            className="invalidation-label"
            x="140"
            y="34"
            textAnchor="middle"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            block
          </text>
          <text
            className="invalidation-label"
            x="264"
            y="34"
            textAnchor="end"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            fresh
          </text>
        </>
      )}
    </svg>
  )
}

export interface InvalidationCompareProps {
  locale: Locale
}

export function InvalidationCompare({ locale }: InvalidationCompareProps) {
  const {
    methods,
    consistencyLabel,
    strongConsistencyText,
    eventualConsistencyText,
    useWhenLabel,
  } = localeData[locale]

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
      className="invalidation-compare not-typeset my-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {methods.map((method) => (
        <article
          key={method.name}
          data-kind={method.consistency}
          className={cn(
            'flex flex-col gap-3 border border-p-bright/14 bg-p-bright/4 p-4',
            '[text-shadow:0_0_12px_var(--color-p-void)]',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <code className="font-mono text-[14px] font-semibold text-p-bright">{method.name}</code>
            <span
              className={cn(
                'shrink-0 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]',
                method.consistency === 'strong'
                  ? 'border-p-signal/40 bg-p-signal/12 text-p-signal'
                  : 'border-p-bright/20 bg-p-bright/6 text-p-dim',
              )}
            >
              {method.timing}
            </span>
          </div>

          <InvalidationRail kind={method.consistency} label={method.railLabel} />

          <code className="block break-all border border-p-bright/12 bg-p-bright/8 px-2 py-1.5 font-mono text-[10px] text-p-mid">
            {method.import}
          </code>
          <p className="text-[14px] leading-relaxed text-p-mid">{method.behavior}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={portal.label}>{consistencyLabel}</span>
            <span className="border border-p-bright/16 bg-p-bright/6 px-1.5 py-0.5 font-mono text-[10px] text-p-bright">
              {method.consistency === 'strong'
                ? strongConsistencyText
                : eventualConsistencyText}
            </span>
          </div>
          <div className="mt-auto space-y-1.5">
            <p className={portal.label}>{useWhenLabel}</p>
            <ul className="space-y-1">
              {method.useWhen.map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] text-p-dim" aria-hidden>
                    →
                  </span>
                  <span className="text-2xs leading-relaxed text-p-mid">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  )
}

// components/mdx/invalidation-compare.tsx
import { cn } from '@/lib/utils'

type Locale = 'en' | 'es'

interface Method {
  name: string
  import: string
  timing: string
  behavior: string
  consistency: 'eventual' | 'strong'
  useWhen: string[]
  color: 'green' | 'blue'
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
    consistencyLabel: 'Consistency:',
    eventualConsistencyText: 'eventual',
    methods: [
      {
        behavior:
          'Marks the entry as stale. The next request triggers a background fetch and serves the previous value meanwhile.',
        color: 'green',
        consistency: 'eventual',
        import: "import { revalidateTag } from 'next/cache'",
        name: 'revalidateTag()',
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
        color: 'blue',
        consistency: 'strong',
        import: "import { updateTag } from 'next/cache'",
        name: 'updateTag()',
        timing: 'Immediate',
        useWhen: [
          'The user just modified data and needs to see the result immediately',
          'Flows where showing the previous value would be a critical UX error',
          'Critical operations: delete, publish, status changes',
        ],
      },
    ],
    strongConsistencyText: 'strong',
    useWhenLabel: 'Use it when...',
  },
  es: {
    consistencyLabel: 'Consistencia:',
    eventualConsistencyText: 'eventual',
    methods: [
      {
        behavior:
          'Marca la entrada como stale. El siguiente request que llegue después lanza un fetch en background y sirve el valor anterior mientras tanto.',
        color: 'green',
        consistency: 'eventual',
        import: "import { revalidateTag } from 'next/cache'",
        name: 'revalidateTag()',
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
        color: 'blue',
        consistency: 'strong',
        import: "import { updateTag } from 'next/cache'",
        name: 'updateTag()',
        timing: 'Inmediato',
        useWhen: [
          'El usuario acaba de modificar un dato y debe ver el resultado de inmediato',
          'Flujos donde mostrar el valor anterior sería un error de UX grave',
          'Operaciones críticas: delete, publish, status changes',
        ],
      },
    ],
    strongConsistencyText: 'fuerte',
    useWhenLabel: 'Usalo cuando...',
  },
}

const colorConfig = {
  blue: {
    accent: 'text-sky-400',
    badge: 'border-sky-500/25 bg-sky-500/10 text-sky-400',
    border: 'border-sky-500/25 bg-sky-500/8',
  },
  green: {
    accent: 'text-emerald-400',
    badge: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
    border: 'border-emerald-500/25 bg-emerald-500/8',
  },
} as const

export function InvalidationCompare({ locale }: { locale: Locale }) {
  const {
    methods,
    consistencyLabel,
    strongConsistencyText,
    eventualConsistencyText,
    useWhenLabel,
  } = localeData[locale]

  return (
    <div className="not-typeset my-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {methods.map((method) => {
        const cfg = colorConfig[method.color]
        return (
          <div key={method.name} className={cn('flex flex-col gap-3 border p-4', cfg.border)}>
            <div className="flex items-center justify-between gap-2">
              <code className={cn('font-mono text-[14px] font-semibold', cfg.accent)}>
                {method.name}
              </code>
              <span className={cn('shrink-0 border px-1.5 py-0.5 font-mono text-[10px]', cfg.badge)}>
                {method.timing}
              </span>
            </div>
            <code className="block break-all border border-p-bright/14 bg-p-void/50 px-2 py-1.5 font-mono text-[10px] text-p-dim">
              {method.import}
            </code>
            <p className="text-[14px] leading-relaxed text-p-mid">{method.behavior}</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-p-dim">
                {consistencyLabel}
              </span>
              <span
                className={cn(
                  'border px-1.5 py-0.5 font-mono text-[10px]',
                  method.consistency === 'strong'
                    ? 'border-sky-500/25 bg-sky-500/10 text-sky-400'
                    : 'border-p-signal/30 bg-p-signal/10 text-p-signal',
                )}
              >
                {method.consistency === 'strong'
                  ? strongConsistencyText
                  : eventualConsistencyText}
              </span>
            </div>
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-p-dim">
                {useWhenLabel}
              </p>
              <ul className="space-y-1">
                {method.useWhen.map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <span className={cn('mt-0.5 shrink-0 text-[10px]', cfg.accent)} aria-hidden>
                      →
                    </span>
                    <span className="text-[11px] leading-relaxed text-p-mid">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}

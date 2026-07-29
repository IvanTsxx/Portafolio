// components/mdx/invalidation-compare.tsx
import { cn } from '@/lib/utils'
import { portal } from '@/lib/portal/styles'

type Locale = 'en' | 'es'

interface Method {
  name: string
  import: string
  timing: string
  behavior: string
  consistency: 'eventual' | 'strong'
  useWhen: string[]
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
      {methods.map((method) => (
        <div
          key={method.name}
          className={cn(
            'flex flex-col gap-3 border border-p-bright/14 bg-p-void/88 p-4',
            '[text-shadow:0_0_12px_var(--color-p-void)]',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <code className="font-mono text-[14px] font-semibold text-p-bright">{method.name}</code>
            <span className="shrink-0 border border-p-bright/16 bg-p-bright/[0.04] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-p-dim">
              {method.timing}
            </span>
          </div>
          <code className="block break-all border border-p-bright/12 bg-p-void/90 px-2 py-1.5 font-mono text-[10px] text-p-mid">
            {method.import}
          </code>
          <p className="text-[14px] leading-relaxed text-p-mid">{method.behavior}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={portal.label}>{consistencyLabel}</span>
            <span className="border border-p-bright/16 bg-p-bright/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-p-bright">
              {method.consistency === 'strong'
                ? strongConsistencyText
                : eventualConsistencyText}
            </span>
          </div>
          <div className="space-y-1.5">
            <p className={portal.label}>{useWhenLabel}</p>
            <ul className="space-y-1">
              {method.useWhen.map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] text-p-dim" aria-hidden>
                    →
                  </span>
                  <span className="text-[11px] leading-relaxed text-p-mid">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}

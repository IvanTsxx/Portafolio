// components/mdx/content-types-table.tsx
import { cn } from '@/lib/utils'

type Locale = 'en' | 'es'

interface ContentType {
  type: 'static' | 'cached' | 'dynamic'
  label: string
  description: string
  directive: string
  servedFrom: string
  examples: string[]
  badge: string
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
        servedFrom: 'Servidor (cada request)',
        type: 'dynamic',
      },
    ],
  },
}

const typeConfig = {
  cached: {
    accent: 'text-emerald-400',
    badgeBg: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
    border: 'border-emerald-500/25 bg-emerald-500/8',
  },
  dynamic: {
    accent: 'text-p-signal',
    badgeBg: 'border-p-signal/30 bg-p-signal/10 text-p-signal',
    border: 'border-p-signal/30 bg-p-signal/8',
  },
  static: {
    accent: 'text-sky-400',
    badgeBg: 'border-sky-500/25 bg-sky-500/10 text-sky-400',
    border: 'border-sky-500/25 bg-sky-500/8',
  },
} as const

export function ContentTypesTable({ locale }: { locale: Locale }) {
  const { types, directiveLabel, servedFromLabel, examplesLabel } = localeData[locale]
  return (
    <div className="not-typeset my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {types.map((item) => {
        const cfg = typeConfig[item.type]
        return (
          <div key={item.type} className={cn('flex flex-col gap-3 border p-4', cfg.border)}>
            <div className="flex items-start justify-between gap-2">
              <span className={cn('text-[14px] font-semibold', cfg.accent)}>{item.label}</span>
              <span className={cn('shrink-0 border px-1.5 py-0.5 font-mono text-[10px]', cfg.badgeBg)}>
                {item.badge}
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-p-mid">{item.description}</p>
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-p-dim">
                {directiveLabel}
              </p>
              <code className={cn('inline-block border px-1.5 py-0.5 font-mono text-[11px]', cfg.badgeBg)}>
                {item.directive}
              </code>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-p-dim">
                {servedFromLabel}
              </p>
              <p className="text-[14px] text-p-bright/85">{item.servedFrom}</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-p-dim">
                {examplesLabel}
              </p>
              <div className="flex flex-wrap gap-1">
                {item.examples.map((ex) => (
                  <span
                    key={ex}
                    className="border border-p-bright/14 bg-p-void/50 px-1.5 py-0.5 font-mono text-[9px] text-p-mid"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// components/mdx/content-types-table.tsx
import { cn } from '@/lib/utils'
import { portal } from '@/lib/portal/styles'

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

export function ContentTypesTable({ locale }: { locale: Locale }) {
  const { types, directiveLabel, servedFromLabel, examplesLabel } = localeData[locale]
  return (
    <div className="not-typeset my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {types.map((item) => (
        <div
          key={item.type}
          className={cn(
            'flex flex-col gap-3 border border-p-bright/14 bg-p-void/88 p-4',
            '[text-shadow:0_0_12px_var(--color-p-void)]',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-[14px] font-semibold text-p-bright">{item.label}</span>
            <span className="shrink-0 border border-p-bright/16 bg-p-bright/[0.04] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-p-dim">
              {item.badge}
            </span>
          </div>
          <p className="text-[14px] leading-relaxed text-p-mid">{item.description}</p>
          <div className="space-y-1">
            <p className={portal.label}>{directiveLabel}</p>
            <code className="inline-block border border-p-bright/14 bg-p-void/90 px-1.5 py-0.5 font-mono text-[11px] text-p-bright">
              {item.directive}
            </code>
          </div>
          <div className="space-y-1">
            <p className={portal.label}>{servedFromLabel}</p>
            <p className="text-[14px] text-p-bright/85">{item.servedFrom}</p>
          </div>
          <div className="space-y-1.5">
            <p className={portal.label}>{examplesLabel}</p>
            <div className="flex flex-wrap gap-1">
              {item.examples.map((ex) => (
                <span
                  key={ex}
                  className="border border-p-bright/12 bg-p-bright/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-p-mid"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

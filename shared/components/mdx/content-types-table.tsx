import { cn } from "@/shared/lib/utils";

type Locale = "en" | "es";

interface ContentType {
  type: "static" | "cached" | "dynamic";
  label: string;
  description: string;
  directive: string;
  servedFrom: string;
  examples: string[];
  badge: string;
}

interface LocaleData {
  directiveLabel: string;
  servedFromLabel: string;
  examplesLabel: string;
  types: ContentType[];
}

const localeData: Record<Locale, LocaleData> = {
  en: {
    directiveLabel: "Directive",
    examplesLabel: "Examples",
    servedFromLabel: "Served from",
    types: [
      {
        badge: "Instant",
        description:
          "Synchronous code, imports, JSX without async. Pre-rendered at build time and served instantly from the CDN.",
        directive: "no directive",
        examples: ["Headers", "Navbars", "Footers", "Static text"],
        label: "Static",
        servedFrom: "CDN (build time)",
        type: "static",
      },
      {
        badge: "Configurable",
        description:
          "Async data that doesn't need to be fresh on every request. Cached on first render and revalidated according to the configured cacheLife.",
        directive: "'use cache'",
        examples: ["Post lists", "Global stats", "Products", "Categories"],
        label: "Cached",
        servedFrom: "Cache (server / CDN)",
        type: "cached",
      },
      {
        badge: "Always fresh",
        description:
          "Data that must be fresh on every request. Accesses cookies, headers, or searchParams. Must be wrapped in Suspense.",
        directive: "<Suspense>",
        examples: ["User data", "Notifications", "Shopping cart", "Preferences"],
        label: "Dynamic",
        servedFrom: "Server (every request)",
        type: "dynamic",
      },
    ],
  },
  es: {
    directiveLabel: "Directiva",
    examplesLabel: "Ejemplos",
    servedFromLabel: "Servido desde",
    types: [
      {
        badge: "Instantáneo",
        description:
          "Código síncrono, imports, JSX sin async. Se pre-renderiza en build time y se sirve desde el CDN instantáneamente.",
        directive: "sin directiva",
        examples: ["Headers", "Navbars", "Footers", "Texto estático"],
        label: "Estático",
        servedFrom: "CDN (build time)",
        type: "static",
      },
      {
        badge: "Configurable",
        description:
          "Datos async que no necesitan ser frescos en cada request. Se cachean en el primer render y se revalidan según el cacheLife configurado.",
        directive: "'use cache'",
        examples: ["Listas de posts", "Stats globales", "Productos", "Categorías"],
        label: "Cacheado",
        servedFrom: "Cache (servidor / CDN)",
        type: "cached",
      },
      {
        badge: "Siempre fresco",
        description:
          "Datos que deben ser frescos en cada request. Acceden a cookies, headers o searchParams. Deben envolverse en Suspense.",
        directive: "<Suspense>",
        examples: ["Datos del usuario", "Notificaciones", "Carrito de compras", "Preferencias"],
        label: "Dinámico",
        servedFrom: "Servidor (cada request)",
        type: "dynamic",
      },
    ],
  },
};

const typeConfig = {
  cached: {
    accent: "text-green-400",
    badgeBg: "bg-green-500/10 text-green-400 border-green-500/20",
    bg: "bg-green-500/8",
    border: "border-green-500/20",
    dot: "bg-green-400",
  },
  dynamic: {
    accent: "text-orange-400",
    badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    bg: "bg-orange-500/8",
    border: "border-orange-500/20",
    dot: "bg-orange-400",
  },
  static: {
    accent: "text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
};

export interface ContentTypesTableProps {
  locale: Locale;
}

export function ContentTypesTable({ locale }: ContentTypesTableProps) {
  const { types, directiveLabel, servedFromLabel, examplesLabel } =
    localeData[locale];
  return (
    <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {types.map((item) => {
        const cfg = typeConfig[item.type];
        return (
          <div
            key={item.type}
            className={cn(
              "rounded-lg border p-4 flex flex-col gap-3",
              cfg.bg,
              cfg.border
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full shrink-0", cfg.dot)} />
                <span className={cn("text-sm font-semibold", cfg.accent)}>
                  {item.label}
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono border rounded px-1.5 py-0.5 shrink-0",
                  cfg.badgeBg
                )}
              >
                {item.badge}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>

            {/* Directive */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                {directiveLabel}
              </p>
              <code
                className={cn(
                  "text-xs font-mono px-1.5 py-0.5 rounded border",
                  cfg.badgeBg
                )}
              >
                {item.directive}
              </code>
            </div>

            {/* Served from */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                {servedFromLabel}
              </p>
              <p className="text-xs text-foreground/80">{item.servedFrom}</p>
            </div>

            {/* Examples */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                {examplesLabel}
              </p>
              <div className="flex flex-wrap gap-1">
                {item.examples.map((ex) => (
                  <span
                    key={ex}
                    className="text-[10px] bg-background/60 border border-border text-muted-foreground px-1.5 py-0.5 rounded"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

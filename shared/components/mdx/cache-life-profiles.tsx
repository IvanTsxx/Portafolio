import { cn } from "@/shared/lib/utils";

type Locale = "en" | "es";

interface Profile {
  name: string;
  stale: string;
  revalidate: string;
  expire: string;
  useCase: string;
}

interface LocaleData {
  columns: string[];
  profiles: Profile[];
}

const localeData: Record<Locale, LocaleData> = {
  en: {
    columns: ["Profile", "stale", "revalidate", "expire", "When to use"],
    profiles: [
      {
        expire: "Never",
        name: "default",
        revalidate: "15 min",
        stale: "5 min",
        useCase: "General use when you don't specify anything",
      },
      {
        expire: "15 min",
        name: "minutes",
        revalidate: "5 min",
        stale: "1 min",
        useCase: "Frequently changing data",
      },
      {
        expire: "4 hours",
        name: "hours",
        revalidate: "1 hour",
        stale: "5 min",
        useCase: "Stats, metrics, feeds",
      },
      {
        expire: "3 days",
        name: "days",
        revalidate: "1 day",
        stale: "5 min",
        useCase: "Posts, products, content pages",
      },
      {
        expire: "1 month",
        name: "weeks",
        revalidate: "1 week",
        stale: "5 min",
        useCase: "Sponsors, rarely modified data",
      },
      {
        expire: "1 year",
        name: "max",
        revalidate: "1 year",
        stale: "30 days",
        useCase: "Static assets, immutable data",
      },
    ],
  },
  es: {
    columns: ["Perfil", "stale", "revalidate", "expire", "Cuándo usar"],
    profiles: [
      {
        expire: "Nunca",
        name: "default",
        revalidate: "15 min",
        stale: "5 min",
        useCase: "Uso general cuando no especificas nada",
      },
      {
        expire: "15 min",
        name: "minutes",
        revalidate: "5 min",
        stale: "1 min",
        useCase: "Datos que cambian con frecuencia",
      },
      {
        expire: "4 horas",
        name: "hours",
        revalidate: "1 hora",
        stale: "5 min",
        useCase: "Estadísticas, métricas, feeds",
      },
      {
        expire: "3 días",
        name: "days",
        revalidate: "1 día",
        stale: "5 min",
        useCase: "Posts, productos, páginas de contenido",
      },
      {
        expire: "1 mes",
        name: "weeks",
        revalidate: "1 semana",
        stale: "5 min",
        useCase: "Sponsors, datos que rara vez cambian",
      },
      {
        expire: "1 año",
        name: "max",
        revalidate: "1 año",
        stale: "30 días",
        useCase: "Assets estáticos, datos inmutables",
      },
    ],
  },
};

export interface CacheLifeProfilesProps {
  locale: Locale;
}

export function CacheLifeProfiles({ locale }: CacheLifeProfilesProps) {
  const { columns, profiles } = localeData[locale];
  return (
    <div className="my-6 overflow-x-auto bg-background rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70"
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
                "border-b border-border/50 transition-colors",
                i % 2 === 0 ? "bg-background" : "bg-secondary/10",
                "hover:bg-secondary/30"
              )}
            >
              <td className="px-4 py-3">
                <code className="text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">
                  '{p.name}'
                </code>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-mono text-blue-400">
                  {p.stale}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-mono text-orange-400">
                  {p.revalidate}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-mono text-red-400">
                  {p.expire}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {p.useCase}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

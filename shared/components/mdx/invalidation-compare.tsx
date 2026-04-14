import { cn } from "@/shared/lib/utils";

interface Method {
  name: string;
  import: string;
  timing: string;
  behavior: string;
  consistency: "eventual" | "strong";
  consistencyLabel?: string;
  useWhen: string[];
  color: "green" | "blue";
}

export interface InvalidationCompareProps {
  methods?: Method[];
  consistencyLabel?: string;
  strongConsistencyText?: string;
  eventualConsistencyText?: string;
  useWhenLabel?: string;
}

const defaultMethods: Method[] = [
  {
    behavior:
      "Marca la entrada como stale. El siguiente request que llegue después lanza un fetch en background y sirve el valor anterior mientras tanto.",
    color: "green",
    consistency: "eventual",
    import: "import { revalidateTag } from 'next/cache'",
    name: "revalidateTag()",
    timing: "Background",
    useWhen: [
      "Creás o actualizás un recurso y está bien que el usuario vea la versión anterior por un request más",
      "Operaciones de alta frecuencia donde el bloqueo sería costoso",
      "La mayoría de los casos",
    ],
  },
  {
    behavior:
      "Invalida la entrada de caché de forma síncrona. El mismo request (y todos los siguientes) ya verán el nuevo valor. No hay ventana de inconsistencia.",
    color: "blue",
    consistency: "strong",
    import: "import { updateTag } from 'next/cache'",
    name: "updateTag()",
    timing: "Inmediato",
    useWhen: [
      "El usuario acaba de modificar un dato y debe ver el resultado de inmediato",
      "Flujos donde mostrar el valor anterior sería un error de UX grave",
      "Operaciones críticas: delete, publish, status changes",
    ],
  },
];

const colorConfig = {
  blue: {
    accent: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  green: {
    accent: "text-green-400",
    badge: "bg-green-500/10 text-green-400 border-green-500/20",
    bg: "bg-green-500/8",
    border: "border-green-500/20",
    dot: "bg-green-400",
  },
};

export function InvalidationCompare({
  methods = defaultMethods,
  consistencyLabel = "Consistencia:",
  strongConsistencyText = "fuerte",
  eventualConsistencyText = "eventual",
  useWhenLabel = "Usalo cuando...",
}: InvalidationCompareProps = {}) {
  return (
    <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {methods.map((method) => {
        const cfg = colorConfig[method.color];
        return (
          <div
            key={method.name}
            className={cn(
              "rounded-lg border p-4 flex flex-col gap-3",
              cfg.bg,
              cfg.border
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", cfg.dot)} />
                <code
                  className={cn("text-sm font-mono font-semibold", cfg.accent)}
                >
                  {method.name}
                </code>
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono border rounded px-1.5 py-0.5 shrink-0",
                  cfg.badge
                )}
              >
                {method.timing}
              </span>
            </div>

            {/* Import */}
            <code className="block text-[10px] font-mono text-muted-foreground/70 bg-background/40 border border-border/50 rounded px-2 py-1.5 break-all">
              {method.import}
            </code>

            {/* Behavior */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {method.behavior}
            </p>

            {/* Consistency */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                {consistencyLabel}
              </span>
              <span
                className={cn(
                  "text-[10px] border rounded px-1.5 py-0.5 font-mono",
                  method.consistency === "strong"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                )}
              >
                {method.consistency === "strong" ? strongConsistencyText : eventualConsistencyText}
              </span>
            </div>

            {/* Use when */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                {useWhenLabel}
              </p>
              <ul className="space-y-1">
                {method.useWhen.map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <span
                      className={cn("text-[10px] mt-0.5 shrink-0", cfg.accent)}
                    >
                      →
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

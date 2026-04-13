"use client";

export function CacheFlowDiagram() {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-border bg-secondary/10 p-6">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-4">
        Ciclo de vida de una entrada de caché
      </p>
      <svg
        viewBox="0 0 720 180"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-2xl"
        role="img"
        aria-label="Diagrama del ciclo de vida de caché: First render → Stale → Revalidating → Expired"
      >
        {/* Timeline base line */}
        <line
          x1="40"
          y1="90"
          x2="680"
          y2="90"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />

        {/* ---- ZONE: STALE ---- */}
        <rect
          x="40"
          y="68"
          width="200"
          height="44"
          rx="6"
          fill="none"
          stroke="hsl(220 70% 55%)"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.4"
        />
        <rect
          x="40"
          y="68"
          width="200"
          height="44"
          rx="6"
          fill="hsl(220 70% 55% / 0.06)"
        />
        <text
          x="140"
          y="86"
          textAnchor="middle"
          fontSize="11"
          fill="hsl(220 70% 70%)"
          fontFamily="monospace"
          fontWeight="600"
        >
          STALE
        </text>
        <text
          x="140"
          y="103"
          textAnchor="middle"
          fontSize="10"
          fill="hsl(var(--muted-foreground))"
          fontFamily="monospace"
        >
          sirve desde caché
        </text>

        {/* ---- ZONE: REVALIDATING ---- */}
        <rect
          x="258"
          y="68"
          width="220"
          height="44"
          rx="6"
          fill="none"
          stroke="hsl(142 70% 45%)"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.4"
        />
        <rect
          x="258"
          y="68"
          width="220"
          height="44"
          rx="6"
          fill="hsl(142 70% 45% / 0.06)"
        />
        <text
          x="368"
          y="86"
          textAnchor="middle"
          fontSize="11"
          fill="hsl(142 70% 55%)"
          fontFamily="monospace"
          fontWeight="600"
        >
          REVALIDATING
        </text>
        <text
          x="368"
          y="103"
          textAnchor="middle"
          fontSize="10"
          fill="hsl(var(--muted-foreground))"
          fontFamily="monospace"
        >
          background fetch, sirve stale
        </text>

        {/* ---- ZONE: EXPIRED ---- */}
        <rect
          x="496"
          y="68"
          width="184"
          height="44"
          rx="6"
          fill="none"
          stroke="hsl(25 90% 55%)"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.4"
        />
        <rect
          x="496"
          y="68"
          width="184"
          height="44"
          rx="6"
          fill="hsl(25 90% 55% / 0.06)"
        />
        <text
          x="588"
          y="86"
          textAnchor="middle"
          fontSize="11"
          fill="hsl(25 90% 60%)"
          fontFamily="monospace"
          fontWeight="600"
        >
          EXPIRED
        </text>
        <text
          x="588"
          y="103"
          textAnchor="middle"
          fontSize="10"
          fill="hsl(var(--muted-foreground))"
          fontFamily="monospace"
        >
          re-genera bloqueado
        </text>

        {/* ---- DOTS & LABELS ---- */}
        {/* First render */}
        <circle cx="40" cy="90" r="5" fill="hsl(220 70% 60%)" />
        <text
          x="40"
          y="140"
          textAnchor="middle"
          fontSize="9"
          fill="hsl(var(--muted-foreground))"
          fontFamily="monospace"
        >
          First
        </text>
        <text
          x="40"
          y="151"
          textAnchor="middle"
          fontSize="9"
          fill="hsl(var(--muted-foreground))"
          fontFamily="monospace"
        >
          render
        </text>

        {/* stale boundary */}
        <circle cx="240" cy="90" r="4" fill="hsl(var(--border))" />
        <line
          x1="240"
          y1="62"
          x2="240"
          y2="90"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text
          x="240"
          y="52"
          textAnchor="middle"
          fontSize="9"
          fill="hsl(var(--muted-foreground))"
          fontFamily="monospace"
        >
          stale
        </text>

        {/* revalidate boundary */}
        <circle cx="478" cy="90" r="4" fill="hsl(var(--border))" />
        <line
          x1="478"
          y1="62"
          x2="478"
          y2="90"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text
          x="478"
          y="52"
          textAnchor="middle"
          fontSize="9"
          fill="hsl(var(--muted-foreground))"
          fontFamily="monospace"
        >
          revalidate
        </text>

        {/* expire boundary */}
        <circle cx="680" cy="90" r="5" fill="hsl(25 90% 55%)" />
        <text
          x="680"
          y="140"
          textAnchor="middle"
          fontSize="9"
          fill="hsl(var(--muted-foreground))"
          fontFamily="monospace"
        >
          expire
        </text>

        {/* ---- ARROW: revalidate loop ---- */}
        <path
          d="M368 68 Q368 28 310 28 Q252 28 252 68"
          stroke="hsl(142 70% 45%)"
          strokeWidth="1.2"
          fill="none"
          strokeDasharray="4 2"
          opacity="0.6"
        />
        <polygon
          points="252,68 248,58 256,60"
          fill="hsl(142 70% 45%)"
          opacity="0.6"
        />
        <text
          x="310"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fill="hsl(142 70% 55%)"
          fontFamily="monospace"
          opacity="0.8"
        >
          nuevo valor listo → actualiza caché
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {[
          { color: "bg-blue-400", label: "stale — se sirve el valor cacheado" },
          {
            color: "bg-green-400",
            label: "revalidate — fetch en background, el cliente no espera",
          },
          {
            color: "bg-orange-400",
            label: "expire — próximo request espera el nuevo valor",
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`size-2 rounded-full shrink-0 ${item.color}`} />
            <span className="text-[11px] text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

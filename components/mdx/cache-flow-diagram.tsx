// components/mdx/cache-flow-diagram.tsx
'use client'

export interface CacheFlowDiagramProps {
  title: string
  ariaLabel: string
  staleDesc: string
  revalidatingDesc: string
  expiredDesc: string
  arrowText: string
  legendStale: string
  legendRevalidate: string
  legendExpire: string
}

export function CacheFlowDiagram({
  title,
  ariaLabel,
  staleDesc,
  revalidatingDesc,
  expiredDesc,
  arrowText,
  legendStale,
  legendRevalidate,
  legendExpire,
}: CacheFlowDiagramProps) {
  return (
    <div className="not-typeset my-6 overflow-x-auto border border-p-bright/16 bg-p-void/60 p-6">
      <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-p-dim">
        {title}
      </p>
      <svg
        viewBox="0 0 720 180"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-2xl"
        role="img"
        aria-label={ariaLabel}
      >
        <line x1="40" y1="90" x2="680" y2="90" stroke="#e8e4dc2e" strokeWidth="1.5" />

        <rect x="40" y="68" width="200" height="44" rx="0" fill="#5b8def0f" stroke="#5b8def66" strokeWidth="1" strokeDasharray="4 2" />
        <text x="140" y="86" textAnchor="middle" fontSize="11" fill="#8eb6ff" fontFamily="monospace" fontWeight="600">
          STALE
        </text>
        <text x="140" y="103" textAnchor="middle" fontSize="10" fill="#b8b2aa" fontFamily="monospace">
          {staleDesc}
        </text>

        <rect x="258" y="68" width="220" height="44" rx="0" fill="#34d3990f" stroke="#34d39966" strokeWidth="1" strokeDasharray="4 2" />
        <text x="368" y="86" textAnchor="middle" fontSize="11" fill="#6ee7b7" fontFamily="monospace" fontWeight="600">
          REVALIDATING
        </text>
        <text x="368" y="103" textAnchor="middle" fontSize="10" fill="#b8b2aa" fontFamily="monospace">
          {revalidatingDesc}
        </text>

        <rect x="496" y="68" width="184" height="44" rx="0" fill="#e85d2a0f" stroke="#e85d2a66" strokeWidth="1" strokeDasharray="4 2" />
        <text x="588" y="86" textAnchor="middle" fontSize="11" fill="#e85d2a" fontFamily="monospace" fontWeight="600">
          EXPIRED
        </text>
        <text x="588" y="103" textAnchor="middle" fontSize="10" fill="#b8b2aa" fontFamily="monospace">
          {expiredDesc}
        </text>

        <circle cx="40" cy="90" r="5" fill="#8eb6ff" />
        <text x="40" y="140" textAnchor="middle" fontSize="9" fill="#b8b2aa" fontFamily="monospace">
          First
        </text>
        <text x="40" y="151" textAnchor="middle" fontSize="9" fill="#b8b2aa" fontFamily="monospace">
          render
        </text>

        <circle cx="240" cy="90" r="4" fill="#e8e4dc40" />
        <line x1="240" y1="62" x2="240" y2="90" stroke="#e8e4dc40" strokeWidth="1" strokeDasharray="3 2" />
        <text x="240" y="52" textAnchor="middle" fontSize="9" fill="#b8b2aa" fontFamily="monospace">
          stale
        </text>

        <circle cx="478" cy="90" r="4" fill="#e8e4dc40" />
        <line x1="478" y1="62" x2="478" y2="90" stroke="#e8e4dc40" strokeWidth="1" strokeDasharray="3 2" />
        <text x="478" y="52" textAnchor="middle" fontSize="9" fill="#b8b2aa" fontFamily="monospace">
          revalidate
        </text>

        <circle cx="680" cy="90" r="5" fill="#e85d2a" />
        <text x="680" y="140" textAnchor="middle" fontSize="9" fill="#b8b2aa" fontFamily="monospace">
          expire
        </text>

        <path
          d="M368 68 Q368 28 310 28 Q252 28 252 68"
          stroke="#34d399"
          strokeWidth="1.2"
          fill="none"
          strokeDasharray="4 2"
          opacity="0.7"
        />
        <polygon points="252,68 248,58 256,60" fill="#34d399" opacity="0.7" />
        <text x="310" y="22" textAnchor="middle" fontSize="9" fill="#6ee7b7" fontFamily="monospace" opacity="0.9">
          {arrowText}
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap gap-4">
        {[
          { color: 'bg-sky-400', label: legendStale },
          { color: 'bg-emerald-400', label: legendRevalidate },
          { color: 'bg-p-signal', label: legendExpire },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`size-2 shrink-0 ${item.color}`} />
            <span className="text-[11px] text-p-mid">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

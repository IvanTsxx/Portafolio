// components/mdx/error-card.tsx
import { cn } from '@/lib/utils'
import { portal } from '@/lib/portal/styles'

export interface ErrorCardProps {
  title: string
  errorMessage?: string
  cause: string
  fix: string
  tip?: string
  causeLabel: string
  fixLabel: string
}

export function ErrorCard({
  title,
  errorMessage,
  cause,
  fix,
  tip,
  causeLabel,
  fixLabel,
}: ErrorCardProps) {
  return (
    <div
      className={cn(
        'not-typeset my-6 overflow-hidden border border-p-bright/16',
        'bg-p-bright/[0.05]',
        '[text-shadow:0_0_12px_var(--color-p-void)]',
      )}
    >
      <div className="flex items-start gap-3 border-b border-p-bright/12 px-4 py-3">
        <div
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-p-bright/28 bg-p-bright/8 font-mono text-[10px] text-p-bright"
          aria-hidden
        >
          ×
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-p-bright">{title}</p>
          {errorMessage ? (
            // plain message panel — NOT a fenced code <pre> (avoids notes-code styles)
            <p
              data-error-message
              className="mt-2 border border-p-bright/12 bg-p-bright/[0.04] px-3 py-2 font-mono text-[11px] leading-relaxed text-p-mid"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-4 py-3">
        <div className="space-y-1">
          <p className={portal.label}>{causeLabel}</p>
          <p className="text-[14px] leading-relaxed text-p-mid">{cause}</p>
        </div>

        <div className="space-y-1">
          <p className={portal.label}>{fixLabel}</p>
          <p className="text-[14px] leading-relaxed text-p-mid">{fix}</p>
        </div>

        {tip ? (
          <div className="flex items-start gap-2 border border-p-bright/12 bg-p-bright/[0.03] px-3 py-2">
            <span className="mt-0.5 shrink-0 font-mono text-[11px] text-p-dim" aria-hidden>
              *
            </span>
            <p className="text-[11px] leading-relaxed text-p-mid">{tip}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// components/mdx/error-card.tsx
import { cn } from '@/lib/utils'

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
        'not-typeset my-6 overflow-hidden border border-p-signal/35 bg-p-signal/8',
        '[text-shadow:0_0_16px_var(--color-p-void),0_0_32px_var(--color-p-void)]',
      )}
    >
      <div className="flex items-start gap-3 border-b border-p-signal/25 bg-p-signal/10 px-4 py-3">
        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-p-signal/45 bg-p-signal/15 font-mono text-[10px] text-p-signal">
          ×
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-p-signal">{title}</p>
          {errorMessage ? (
            <code className="mt-1 block break-all font-mono text-[11px] text-p-signal/80">
              {errorMessage}
            </code>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-p-dim">
            {causeLabel}
          </p>
          <p className="text-[14px] leading-relaxed text-p-mid">{cause}</p>
        </div>

        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-p-bright/70">
            {fixLabel}
          </p>
          <p className="text-[14px] leading-relaxed text-p-mid">{fix}</p>
        </div>

        {tip ? (
          <div className="flex items-start gap-2 border border-p-bright/18 bg-p-bright/5 px-3 py-2">
            <span className="mt-0.5 shrink-0 font-mono text-[11px] text-p-signal" aria-hidden>
              *
            </span>
            <p className="text-[11px] leading-relaxed text-p-mid">{tip}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

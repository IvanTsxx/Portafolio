import { cn } from "@/shared/lib/utils";

export interface ErrorCardProps {
  title: string;
  errorMessage?: string;
  cause: string;
  fix: string;
  tip?: string;
  causeLabel?: string;
  fixLabel?: string;
}

export function ErrorCard({
  title,
  errorMessage,
  cause,
  fix,
  tip,
  causeLabel = "Causa",
  fixLabel = "Solución",
}: ErrorCardProps) {
  return (
    <div className="my-6 rounded-lg border border-red-500/20 bg-red-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-red-500/20 bg-red-500/8">
        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-300">{title}</p>
          {errorMessage && (
            <code className="mt-1 block text-[11px] font-mono text-red-400/80 break-all">
              {errorMessage}
            </code>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60">
            {causeLabel}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {cause}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-medium text-green-400/60">
            {fixLabel}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{fix}</p>
        </div>

        {tip && (
          <div
            className={cn(
              "rounded border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 flex gap-2 items-start"
            )}
          >
            <span className="text-yellow-400 text-xs shrink-0 mt-0.5">⚑</span>
            <p className="text-[11px] text-yellow-300/80 leading-relaxed">
              {tip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

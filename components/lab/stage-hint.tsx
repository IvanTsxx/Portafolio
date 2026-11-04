import { cn } from "@/lib/utils";

interface StageHintProps {
  label: string;
  touchLabel: string;
  isDismissed: boolean;
}

export const StageHint = ({
  label,
  touchLabel,
  isDismissed,
}: StageHintProps) => (
  <span
    aria-hidden
    data-stage-hint=""
    className={cn(
      "label border-border-strong bg-background/80 text-foreground ease-out-expo pointer-events-none absolute bottom-4 left-4 z-40 flex items-center gap-2 border px-2.5 py-1.5 transition duration-500 motion-reduce:transition-none",
      isDismissed && "translate-y-1 opacity-0"
    )}
  >
    <span className="bg-foreground size-1.5 motion-safe:animate-pulse" />
    <span className="pointer-coarse:hidden">{label}</span>
    <span className="hidden pointer-coarse:inline">{touchLabel}</span>
  </span>
);

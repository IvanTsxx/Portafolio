import { cn } from "@/shared/lib/utils";

interface SectionHeaderProps {
  label: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  label,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 border-t border-border pt-3", className)}>
      <div className="flex items-center justify-between">
        <span className="  text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

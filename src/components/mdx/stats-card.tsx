import { cn } from "@/lib/cn";

interface StatsCardProps {
  label: string;
  value: string;
  className?: string;
}

export function StatsCard({ label, value, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-fd-border bg-fd-card p-6 text-center transition-all duration-300 hover:border-brand/50 hover:bg-brand/5 hover:shadow-brand/5 hover:shadow-lg",
        className
      )}
    >
      <span className="font-bold text-3xl text-fd-foreground tracking-tight md:text-4xl">
        {value}
      </span>
      <span className="mt-2 font-medium text-fd-muted-foreground text-sm uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {children}
    </div>
  );
}

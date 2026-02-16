import { cn } from "@/lib/cn";

interface TechBadgeProps {
  name: string;
  className?: string;
}

export function TechBadge({ name, className }: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-fd-border bg-fd-secondary/50 px-3 py-1 font-medium text-fd-muted-foreground text-sm transition-all duration-300 hover:border-brand/50 hover:bg-brand/10 hover:text-brand hover:shadow-[0_0_15px_-3px_rgba(96,148,110,0.2)]",
        className
      )}
    >
      {name}
    </span>
  );
}

interface TechStackProps {
  technologies: string[];
  className?: string;
}

export function TechStack({ technologies, className }: TechStackProps) {
  return (
    <div className={cn("not-prose flex flex-wrap gap-2", className)}>
      {technologies.map((tech) => (
        <TechBadge key={tech} name={tech} />
      ))}
    </div>
  );
}

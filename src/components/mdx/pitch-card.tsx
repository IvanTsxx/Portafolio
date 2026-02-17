import {
  ArrowRight,
  Code,
  Database,
  Layout,
  Lock,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface PitchCardProps {
  title: string;
  description: string;
  href?: string;
  cta?: string;
  icon?: React.ReactNode;
  iconName?:
    | "rocket"
    | "shield"
    | "zap"
    | "database"
    | "layout"
    | "search"
    | "code"
    | "lock"
    | "sparkles";
  className?: string;
}

export function PitchCard({
  title,
  description,
  href = "/contact",
  cta = "Hablemos",
  icon,
  iconName,
  className,
}: PitchCardProps) {
  const IconMap = {
    rocket: Rocket,
    shield: Shield,
    zap: Zap,
    database: Database,
    layout: Layout,
    search: Search,
    code: Code,
    lock: Lock,
    sparkles: Sparkles,
  };

  const IconComponent =
    iconName && IconMap[iconName] ? IconMap[iconName] : Sparkles;
  const renderedIcon = icon || <IconComponent className="h-5 w-5" />;

  const content = (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-xl border border-fd-border bg-fd-card p-6 transition-all duration-300 hover:border-brand/50 hover:shadow-brand/5 hover:shadow-lg dark:hover:shadow-brand/10",
        className
      )}
    >
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand/10 blur-3xl transition-all duration-500 group-hover:bg-brand/20" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/20 ring-inset transition-colors group-hover:bg-brand/20">
            {renderedIcon}
          </div>
          <h3 className="font-semibold text-fd-foreground text-lg transition-colors group-hover:text-brand">
            {title}
          </h3>
        </div>

        <p className="text-fd-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="mt-2 flex -translate-x-2 items-center gap-2 font-medium text-brand text-sm opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Decorative gradient line at the bottom */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-brand to-brand/50 transition-all duration-300 group-hover:w-full" />
    </div>
  );

  if (href) {
    return (
      <Link className="not-prose block no-underline" href={href}>
        {content}
      </Link>
    );
  }

  return <div className="not-prose">{content}</div>;
}

export function PitchGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      {children}
    </div>
  );
}

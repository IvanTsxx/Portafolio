import { ArrowRight, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { TechStack } from "./tech-badge";

interface TimelineItemProps {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements?: string[];
  technologies?: string[];
  current?: boolean;
  href?: string;
}

export function TimelineItem({
  title,
  company,
  period,
  description,
  achievements = [],
  technologies = [],
  current = false,
  href,
}: TimelineItemProps) {
  return (
    <div className="not-prose group relative flex gap-6 pb-10 last:pb-0">
      {/* Vertical line */}
      <div className="absolute top-0 left-[17px] h-full w-px bg-fd-border group-last:hidden" />

      {/* Dot */}
      <div className="relative z-10 flex shrink-0 items-center justify-center">
        <div
          className={cn(
            "flex h-[35px] w-[35px] items-center justify-center rounded-full border-2 transition-colors duration-300",
            current
              ? "border-brand bg-brand/10"
              : "border-fd-border bg-fd-card group-hover:border-brand/50"
          )}
        >
          {current ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
            </span>
          ) : (
            <Briefcase className="h-3.5 w-3.5 text-fd-muted-foreground group-hover:text-brand" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        {/* Period Badge */}
        <div className="mb-2 flex items-center gap-1.5 text-fd-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">{period}</span>
          {current && (
            <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-medium text-[10px] text-brand">
              Actual
            </span>
          )}
        </div>

        {/* Title & Company */}
        <h3 className="font-semibold text-fd-foreground text-lg leading-tight">
          {title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 font-medium text-brand text-sm">
          <Briefcase className="h-3 w-3" />
          {company}
        </p>

        {/* Description */}
        <p className="mt-2 text-fd-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        {/* Achievements */}
        {achievements.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {achievements.map((achievement) => (
              <li
                className="flex items-start gap-2 text-fd-muted-foreground text-sm"
                key={achievement}
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                {achievement}
              </li>
            ))}
          </ul>
        )}

        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="mt-3">
            <TechStack technologies={technologies} />
          </div>
        )}

        {/* Link to detail page */}
        {href && (
          <Link
            className="mt-3 inline-flex items-center gap-1 text-brand text-sm transition-colors hover:text-brand/80"
            href={href}
          >
            Ver más
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

interface TimelineProps {
  children: React.ReactNode;
}

export function Timeline({ children }: TimelineProps) {
  return <div className="not-prose my-8">{children}</div>;
}

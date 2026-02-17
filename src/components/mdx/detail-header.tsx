import { ArrowLeft, Building, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { TechStack } from "./tech-badge";

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  period?: string;
  backHref?: string;
  backLabel?: string;
  technologies?: string[];
  links?: { label: string; url: string }[];
  current?: boolean;
  company: string;
}

export function DetailHeader({
  title,
  subtitle,
  period,
  backHref,
  backLabel = "Volver",
  technologies = [],
  links = [],
  current = false,
  company,
}: DetailHeaderProps) {
  return (
    <div className="not-prose mb-8 border-fd-border border-b pb-8">
      {backHref && (
        <Link
          className="mb-4 inline-flex items-center gap-1.5 text-fd-muted-foreground text-sm transition-colors hover:text-brand"
          href={backHref}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <h1 className="font-bold text-2xl text-fd-foreground tracking-tight sm:text-3xl">
              {title}
            </h1>
            {current && (
              <span className="mt-1 shrink-0 rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-medium text-brand text-xs">
                Actual
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5" />
            <span className="text-fd-muted-foreground text-sm">{company}</span>
          </div>
        </div>

        {subtitle && (
          <p className="text-fd-muted-foreground text-lg">{subtitle}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-fd-muted-foreground text-sm">
          {period && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {period}
            </span>
          )}
          {links.map((link) => (
            <a
              className="inline-flex items-center gap-1 text-brand transition-colors hover:text-brand/80"
              href={link.url}
              key={link.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {link.label}
            </a>
          ))}
        </div>

        {technologies.length > 0 && (
          <div className="mt-1">
            <TechStack technologies={technologies} />
          </div>
        )}
      </div>
    </div>
  );
}

import { ExternalLink, Github, Link2 } from "lucide-react";
import Link from "next/link";
import { TechStack } from "./tech-badge";

interface ProjectCardProps {
  title: string;
  description: string;
  technologies?: string[];
  repoUrl?: string;
  demoUrl?: string;
  npmUrl?: string;
  internalRoute: string;
}

export function ProjectCard({
  title,
  description,

  technologies = [],
  repoUrl,
  demoUrl,
  npmUrl,
  internalRoute,
}: ProjectCardProps) {
  return (
    <div className="not-prose group flex flex-col justify-between rounded-xl border border-fd-border bg-fd-card p-5 transition-all duration-300 hover:border-brand/40 hover:shadow-brand/5 hover:shadow-lg">
      <Link className="flex items-center gap-2" href={internalRoute}>
        <Link2 className="h-3.5 w-3.5" />
        <h3 className="font-bold text-fd-foreground text-lg transition-colors group-hover:text-brand">
          {title}
        </h3>
      </Link>

      <p className="mt-1 text-fd-muted-foreground/70 text-sm leading-relaxed">
        {description}
      </p>

      {technologies.length > 0 && (
        <div className="mt-3">
          <TechStack technologies={technologies} />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 border-fd-border border-t pt-3 text-sm">
        {demoUrl && (
          <a
            className="inline-flex items-center gap-1 text-brand transition-colors hover:text-brand/80"
            href={demoUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Demo
          </a>
        )}
        {repoUrl && (
          <a
            className="inline-flex items-center gap-1 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            href={repoUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Github className="h-3.5 w-3.5" />
            Código
          </a>
        )}
        {npmUrl && (
          <a
            className="inline-flex items-center gap-1 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            href={npmUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            NPM
          </a>
        )}
      </div>
    </div>
  );
}

interface ProjectGridProps {
  children: React.ReactNode;
}

export function ProjectGrid({ children }: ProjectGridProps) {
  return <div className="not-prose grid gap-3 sm:grid-cols-2">{children}</div>;
}

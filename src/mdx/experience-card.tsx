import { ExternalLink } from "lucide-react";
import { TechStack } from "./tech-badge";

interface ExperienceCardProps {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements?: string[];
  technologies?: string[];
  current?: boolean;
  link?: string;
}

export function ExperienceCard({
  title,
  company,
  period,
  description,
  achievements = [],
  technologies = [],
  current = false,
  link,
}: ExperienceCardProps) {
  return (
    <div className="not-prose rounded-lg border border-fd-border p-5 transition-colors hover:bg-fd-secondary/50">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-fd-foreground">{title}</h3>
            {current && (
              <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-medium text-[10px] text-brand">
                Actual
              </span>
            )}
          </div>
          <p className="mt-0.5 text-fd-muted-foreground text-sm">
            {company} · {period}
          </p>
        </div>
        {link && (
          <a
            className="rounded-lg p-2 text-fd-muted-foreground transition-colors hover:bg-fd-secondary/50"
            href={link}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <p className="mb-3 text-fd-muted-foreground text-sm leading-relaxed">
        {description}
      </p>

      {achievements.length > 0 && (
        <ul className="mb-3 space-y-1">
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

      {technologies.length > 0 && (
        <div className="mt-3 border-fd-border border-t pt-3">
          <TechStack technologies={technologies} />
        </div>
      )}
    </div>
  );
}

interface ExperienceGridProps {
  children: React.ReactNode;
}

export function ExperienceGrid({ children }: ExperienceGridProps) {
  return <div className="not-prose grid gap-3">{children}</div>;
}

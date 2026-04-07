import { Link as LinkIcon } from "lucide-react";

import { Icons } from "@/shared/components/icons";
import { Markdown } from "@/shared/components/markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { Project } from "@/shared/config/projects";

function SkillBadge({ skill }: { skill: string }) {
  return (
    <span className="text-[11px] border border-border px-2 py-0.5 text-muted-foreground transition-colors hover:border-brand-green hover:text-brand-green cursor-default">
      {skill}
    </span>
  );
}

interface ProjectItemProps {
  project: Project;
}

export function ProjectItem({ project }: ProjectItemProps) {
  const periodEnd = project.period.end ?? "∞";
  const Icon = project.github ? Icons.Github : LinkIcon;

  return (
    <Accordion className="w-full group">
      <AccordionItem value={project.id} className="border-b border-border">
        <AccordionTrigger className="py-3 hover:no-underline">
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <Icon
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-[14px] font-semibold text-foreground truncate">
              {project.title}
            </span>
            <span className="ml-auto transition-colors group-hover:text-brand-green  text-[12px] text-muted-foreground shrink-0 pr-2">
              {project.period.start} → {periodEnd}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="flex flex-col gap-3 pl-7">
            {/* Description */}
            <div className="prose-sm prose dark:prose-invert">
              <Markdown content={project.description} />
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {project.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>

            {/* Links */}
            {(project.github || project.link) && (
              <div className="flex items-center gap-4">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="  text-[12px] text-muted-foreground transition-colors hover:text-brand-green"
                  >
                    ↗ GitHub
                  </a>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="  text-[12px] text-muted-foreground transition-colors hover:text-brand-green"
                  >
                    ↗ Live
                  </a>
                )}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

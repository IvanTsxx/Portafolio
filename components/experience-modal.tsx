"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Briefcase, Calendar, X } from "lucide-react";
import { MDXRenderer } from "@/components/mdx-renderer";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  companyUrl?: string | null;
  description?: string | null;
  content: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  technologies: { id: string; name: string }[];
}

interface ExperienceModalProps {
  experience: ExperienceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExperienceModal({
  experience,
  open,
  onOpenChange,
}: ExperienceModalProps) {
  if (!experience) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto rounded-2xl bg-card/98 p-0 backdrop-blur-xl sm:max-w-2xl"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-border/30 border-b bg-card/95 px-6 py-5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">Cerrar</span>
          </button>

          <DialogHeader className="pr-10">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="size-3.5" />
              <span>
                {format(new Date(experience.startDate), "MMMM yyyy", {
                  locale: es,
                })}{" "}
                —{" "}
                {experience.current
                  ? "Presente"
                  : experience.endDate
                    ? format(new Date(experience.endDate), "MMMM yyyy", {
                        locale: es,
                      })
                    : "Presente"}
              </span>
            </div>
            <DialogTitle className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
              {experience.position}
            </DialogTitle>
            <DialogDescription className="mt-1 flex items-center gap-2 text-base text-muted-foreground">
              <Briefcase className="size-4" />
              {experience.company}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Description */}
          {experience.description && (
            <p className="text-base text-foreground/90 leading-relaxed">
              {experience.description}
            </p>
          )}

          {/* MDX Content - Responsibilities */}
          {experience.content && (
            <div className="prose prose-slate prose-sm max-w-none">
              <MDXRenderer content={experience.content} />
            </div>
          )}

          {/* Technologies */}
          <div className="space-y-3 border-border/30 border-t pt-6">
            <h4 className="font-medium text-foreground text-sm">
              Tecnologías utilizadas
            </h4>
            <div className="flex flex-wrap gap-2">
              {experience.technologies.map((tech) => (
                <Badge
                  key={tech.id}
                  variant="secondary"
                  className="rounded-lg px-3 py-1"
                >
                  {tech.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

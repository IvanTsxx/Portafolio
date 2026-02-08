"use client";

import { Briefcase, Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";
import { type ExperienceItem, ExperienceModal } from "./experience-modal";

interface ExperienceTimelineProps {
  experiences: ExperienceItem[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  });
}

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const [selectedExperience, setSelectedExperience] =
    useState<ExperienceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (experience: ExperienceItem) => {
    setSelectedExperience(experience);
    setIsModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setTimeout(() => setSelectedExperience(null), 200);
    }
  };

  return (
    <>
      {/* Horizontal Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-8 right-0 left-0 h-px bg-border/60" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {experiences.map((exp, index) => (
            <button
              key={exp.id}
              type="button"
              onClick={() => handleOpenModal(exp)}
              className="group relative animate-initial animate-slide-up text-left"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Timeline dot */}
              <div className="absolute top-6 left-0 flex size-4 items-center justify-center">
                <div className="size-3 rounded-full border-2 border-primary bg-background transition-all duration-300 group-hover:scale-125 group-hover:border-primary/80" />
              </div>

              <div className="ml-8 cursor-pointer rounded-xl border border-transparent bg-card/50 p-4 pt-10 transition-all duration-300 group-hover:border-primary/20 group-hover:bg-card/80 group-hover:shadow-md">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Calendar className="size-3" />
                  <span>
                    {formatDate(exp.startDate)} —{" "}
                    {exp.endDate ? formatDate(exp.endDate) : "Presente"}
                  </span>
                </div>

                <h3 className="mt-2 font-medium text-foreground transition-colors group-hover:text-primary">
                  {exp.position}
                </h3>

                <p className="mt-1 flex items-center gap-1 text-muted-foreground text-sm">
                  <Briefcase className="size-3" />
                  {exp.company}
                </p>

                {exp.description && (
                  <p className="mt-3 line-clamp-2 text-muted-foreground text-sm">
                    {exp.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {exp.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech.id}
                      className="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground text-xs"
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>

                {/* Ver más indicator */}
                <div className="mt-4 flex items-center gap-1 text-primary text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span>Ver detalles</span>
                  <ChevronRight className="size-3" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {experiences.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            Próximamente agregaré mi experiencia laboral.
          </p>
        )}
      </div>

      {/* Modal */}
      <ExperienceModal
        experience={selectedExperience}
        open={isModalOpen}
        onOpenChange={handleCloseModal}
      />
    </>
  );
}

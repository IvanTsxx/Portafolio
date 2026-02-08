import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";
import { getExperiences } from "@/app/actions/experiences";
import { MDXRenderer } from "@/components/mdx-renderer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experiencia",
  description:
    "Experiencia profesional de Iván Bongiovanni, Full-Stack Developer.",
};

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="space-y-16">
          {/* Header */}
          <div className="space-y-4 text-cente">
            <h1 className="font-semibold text-4xl text-foreground tracking-tight lg:text-5xl">
              Experiencia profesional
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              Mi trayectoria profesional construyendo productos digitales
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line - centered on desktop */}
            <div className="absolute top-0 bottom-0 left-5 w-px bg-border/60 lg:left-1/2 lg:-translate-x-1/2" />

            <div className="space-y-12">
              {experiences.map((experience, index) => (
                <div
                  key={experience.id}
                  className={`relative ${
                    index % 2 === 0
                      ? "lg:pr-[calc(50%+2rem)]"
                      : "lg:pl-[calc(50%+2rem)]"
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute top-8 left-5 size-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background lg:left-1/2`}
                  />

                  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div
                      className={cn(
                        "absolute top-1/6 right-0 h-[200px] w-[200px] -translate-y-1/2 rounded-full bg-linear-to-tr from-primary/60 via-primary/40 to-transparent blur-3xl",
                        index % 2 === 0 ? "lg:right-0" : "lg:left-0",
                      )}
                    />
                  </div>

                  {/* Card */}
                  <div className="ml-12 rounded-2xl border border-border/30 bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg lg:ml-0">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <time>
                          {format(new Date(experience.startDate), "MMM yyyy", {
                            locale: es,
                          })}
                        </time>
                        <span>—</span>
                        <time>
                          {experience.current
                            ? "Actualidad"
                            : experience.endDate
                              ? format(
                                  new Date(experience.endDate),
                                  "MMM yyyy",
                                  { locale: es },
                                )
                              : "Actualidad"}
                        </time>
                        {experience.current && (
                          <Badge
                            variant="default"
                            className="ml-2 rounded-lg text-xs"
                          >
                            Actual
                          </Badge>
                        )}
                      </div>
                      <h2 className="font-medium text-foreground text-xl">
                        {experience.position}
                      </h2>
                      <p className="font-medium text-muted-foreground">
                        {experience.company}
                      </p>
                    </div>

                    {/* Description */}
                    {experience.description && (
                      <p className="mt-4 text-muted-foreground/90 leading-relaxed">
                        {experience.description}
                      </p>
                    )}

                    {/* MDX Content */}
                    {experience.content && (
                      <div className="prose-slate mt-4 max-w-none text-sm">
                        <MDXRenderer content={experience.content} />
                      </div>
                    )}

                    {/* Technologies */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {experience.technologies.map((tech) => (
                        <Badge
                          key={tech.id}
                          variant="secondary"
                          className="rounded-lg text-xs"
                        >
                          {tech.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {experiences.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-xl">
                No hay experiencias registradas aún.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

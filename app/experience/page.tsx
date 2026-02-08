import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";
import { getExperiences } from "@/app/actions/experiences";

import { MDXRenderer } from "@/components/mdx-renderer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Experiencia",
  description:
    "Experiencia profesional de Iván Bongiovanni, Full-Stack Developer.",
};

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-4xl px-4 py-20 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="font-bold text-4xl text-foreground tracking-tight lg:text-5xl">
              Experiencia profesional
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              Mi trayectoria profesional construyendo productos digitales
            </p>
          </div>

          <div className="relative space-y-8">
            {/* Timeline line */}
            <div className="absolute top-0 bottom-0 left-4 w-px bg-border lg:left-1/2" />

            {experiences.map((experience, index) => (
              <div
                key={experience.id}
                className={`relative ${
                  index % 2 === 0
                    ? "lg:ml-auto lg:w-[calc(50%-2rem)]"
                    : "lg:mr-auto lg:w-[calc(50%-2rem)]"
                }`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute top-6 left-4 size-3 -translate-x-1/2 rounded-full bg-primary ring-4 ring-background lg:left-auto ${
                    index % 2 === 0
                      ? "lg:right-[calc(100%+1.5rem)]"
                      : "lg:left-[calc(100%+1.5rem)]"
                  }`}
                />

                <Card className="ml-8 lg:ml-0">
                  <CardHeader>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">
                        {experience.position}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-lg">
                          {experience.company}
                        </span>
                        {/* {experience.companyUrl && (
                          <a
                            href={experience.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        )} */}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {format(new Date(experience.startDate), "MMM yyyy", {
                          locale: es,
                        })}{" "}
                        -{" "}
                        {experience.current
                          ? "Actualidad"
                          : experience.endDate
                            ? format(new Date(experience.endDate), "MMM yyyy", {
                                locale: es,
                              })
                            : "Actualidad"}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {experience.description}
                    </p>

                    <div className="prose prose-slate max-w-none text-sm">
                      <MDXRenderer content={experience.content} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {experience.technologies.map((tech) => (
                        <Badge key={tech.id} variant="secondary">
                          {tech.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
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

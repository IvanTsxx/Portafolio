import { ExternalLink, Github } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/app/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Proyectos destacados de Iván Bongiovanni, Full-Stack Developer especializado en Next.js y React.",
};

export default async function ProjectsPage() {
  const projects = await getProjects(true);

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="font-bold text-4xl text-foreground tracking-tight lg:text-5xl">
              Proyectos destacados
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              Una selección de proyectos que demuestran mis habilidades técnicas
              y enfoque en soluciones reales
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group flex flex-col transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                {project.coverImage && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    <img
                      src={project.coverImage || "/placeholder.svg"}
                      alt={project.title}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="hover:text-primary"
                    >
                      {project.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <Badge
                        key={tech.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tech.name}
                      </Badge>
                    ))}
                    {project.technologies.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 5}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {project.demoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        render={
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 size-4" />
                            Demo
                          </a>
                        }
                      />
                    )}
                    {project.githubUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        render={
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="mr-2 size-4" />
                            Código
                          </a>
                        }
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-xl">
                No hay proyectos publicados aún.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

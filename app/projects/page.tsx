import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/app/actions/projects";
import { getTechnologies } from "@/app/actions/taxonamy";
import { ListFilters } from "@/components/list-filters";
import { ProjectActions } from "@/components/project-actions";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Proyectos destacados de Iván Bongiovanni, Full-Stack Developer especializado en Next.js y React.",
  alternates: {
    canonical: "https://ivantsx.dev/projects",
  },
};

const sortOptions = [
  { value: "recent", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "featured", label: "Destacados" },
];

interface ProjectsPageProps {
  searchParams: Promise<{ tech?: string; sort?: string }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;
  const [allProjects, technologies] = await Promise.all([
    getProjects({
      limit: 100,
    }),
    getTechnologies(),
  ]);

  // Filter by technology
  let projects = allProjects;
  if (params.tech) {
    projects = projects.filter((p) =>
      p.technologies.some((t) => t.slug === params.tech),
    );
  }

  // Sort
  const sortValue = params.sort || "recent";
  switch (sortValue) {
    case "oldest":
      projects = [...projects].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      break;
    case "featured":
      projects = [...projects].sort(
        (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
      );
      break;
    default:
      // recent - already sorted by createdAt desc from DB
      break;
  }

  return (
    <main className="min-h-screen">
      <section className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/6 right-0 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-linear-to-tr from-primary/60 via-primary/40 to-transparent blur-3xl" />
        </div>
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="font-semibold text-4xl text-foreground tracking-tight lg:text-5xl">
              Proyectos destacados
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              Una selección de proyectos que demuestran mis habilidades técnicas
              y enfoque en soluciones reales
            </p>
          </div>

          {/* Filters */}
          <ListFilters
            filters={technologies}
            filterKey="tech"
            filterLabel="Tecnología"
            sortOptions={sortOptions}
            currentFilter={params.tech}
            currentSort={sortValue}
          />

          {/* Projects Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-xl"
              >
                {/* Cover Image */}
                {project.coverImage ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {project.featured && (
                      <Badge className="absolute top-3 right-3 rounded-lg">
                        Destacado
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="relative flex aspect-video w-full items-center justify-center bg-muted/30">
                    <span className="text-4xl text-muted-foreground/30">
                      {project.title.charAt(0)}
                    </span>
                    {project.featured && (
                      <Badge className="absolute top-3 right-3 rounded-lg">
                        Destacado
                      </Badge>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-medium text-foreground text-lg transition-colors group-hover:text-primary">
                    {project.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 flex-1 text-muted-foreground text-sm leading-relaxed">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <Badge
                        key={tech.id}
                        variant="secondary"
                        className="rounded-lg text-xs"
                      >
                        {tech.name}
                      </Badge>
                    ))}
                    {project.technologies.length > 4 && (
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        +{project.technologies.length - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <ProjectActions
                    demoUrl={project.demoUrl}
                    githubUrl={project.githubUrl}
                  />
                </div>
              </Link>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-xl">
                No hay proyectos que coincidan con los filtros.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

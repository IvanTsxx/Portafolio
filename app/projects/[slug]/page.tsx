import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/app/actions/projects";
import { MDXRenderer } from "@/components/mdx-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects(true);
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: "Proyecto no encontrado",
    };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description || "",
      images: project.coverImage ? [project.coverImage] : [],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project || !project.published) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <article className="relative mx-auto max-w-4xl px-4 py-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/6 right-0 h-[200px] w-[200px] -translate-y-1/2 rounded-full bg-linear-to-tr from-primary/60 via-primary/40 to-transparent blur-3xl" />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              render={
                <Link href="/projects">
                  <ArrowLeft className="mr-2 size-4" />
                  Volver a proyectos
                </Link>
              }
            />

            <h1 className="font-bold text-4xl text-foreground tracking-tight lg:text-5xl">
              {project.title}
            </h1>

            <p className="text-muted-foreground text-xl">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech.id} variant="secondary">
                  {tech.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {project.demoUrl && (
                <Button
                  render={
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 size-4" />
                      Ver demo
                    </a>
                  }
                />
              )}
              {project.githubUrl && (
                <Button
                  variant="outline"
                  render={
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 size-4" />
                      Ver código
                    </a>
                  }
                />
              )}
            </div>
          </div>

          {project.coverImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-lg">
              <img
                src={project.coverImage || "/placeholder.svg"}
                alt={project.title}
                className="size-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-slate max-w-none">
            <MDXRenderer content={project.content} />
          </div>
        </div>
      </article>
    </main>
  );
}

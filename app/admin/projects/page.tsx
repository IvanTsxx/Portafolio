import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, EyeOff, Plus, Star } from "lucide-react";
import Link from "next/link";
import { getProjects } from "@/app/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminProjectsPage() {
  const projects = await getProjects(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">
            Administra tus proyectos destacados
          </p>
        </div>
        <Button
          render={
            <Link href="/admin/projects/new">
              <Plus className="mr-2 size-4" />
              Nuevo proyecto
            </Link>
          }
        />
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="hover:text-primary"
                    >
                      {project.title}
                    </Link>
                    {project.featured && (
                      <Badge variant="default" className="gap-1">
                        <Star className="size-3" />
                        Destacado
                      </Badge>
                    )}
                    {project.published ? (
                      <Badge variant="default" className="gap-1">
                        <Eye className="size-3" />
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="size-3" />
                        Borrador
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {project.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <span>
                  {format(project.createdAt, "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
                {project.technologies.slice(0, 5).map((tech) => (
                  <Badge key={tech.id} variant="secondary">
                    {tech.name}
                  </Badge>
                ))}
                {project.technologies.length > 5 && (
                  <Badge variant="secondary">
                    +{project.technologies.length - 5}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <p className="text-muted-foreground">
                No hay proyectos aún. Crea tu primer proyecto.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

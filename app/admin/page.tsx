import { Briefcase, FileText, FolderKanban, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { getExperiences } from "@/app/actions/experiences";
import { getPosts } from "@/app/actions/posts";
import { getProjects } from "@/app/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const posts = await getPosts(false);
  const projects = await getProjects(false);
  const experiences = await getExperiences();

  const stats = [
    {
      title: "Posts",
      value: posts.length,
      published: posts.filter((p) => p.published).length,
      icon: FileText,
    },
    {
      title: "Proyectos",
      value: projects.length,
      published: projects.filter((p) => p.published).length,
      icon: FolderKanban,
    },
    {
      title: "Experiencias",
      value: experiences.length,
      published: experiences.length,
      icon: Briefcase,
    },
  ];

  const recentPosts = posts
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const recentProjects = projects
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Vista general de tu portafolio
          </p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              render={
                <Link href="/admin/posts/new">
                  <Plus className="mr-2 size-4" />
                  Nuevo Post
                </Link>
              }
            />
            <Button
              variant="outline"
              render={
                <Link href="/admin/projects/new">
                  <Plus className="mr-2 size-4" />
                  Nuevo Proyecto
                </Link>
              }
            />
            <Button
              variant="outline"
              render={
                <Link href="/admin/experiences/new">
                  <Plus className="mr-2 size-4" />
                  Nueva Experiencia
                </Link>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{stat.value}</div>
                <p className="text-muted-foreground text-xs">
                  {stat.published} publicados
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contenido reciente */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimos Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Últimos Posts</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              render={<Link href="/admin/posts">Ver todos</Link>}
            />
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No hay posts aún
              </p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{post.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(post.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Publicado" : "Borrador"}
                      </Badge>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        render={
                          <Link href={`/admin/posts/${post.id}`}>
                            <Pencil className="size-4" />
                          </Link>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Proyectos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Últimos Proyectos</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              render={<Link href="/admin/projects">Ver todos</Link>}
            />
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No hay proyectos aún
              </p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{project.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(project.createdAt).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={project.published ? "default" : "secondary"}
                      >
                        {project.published ? "Publicado" : "Borrador"}
                      </Badge>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        render={
                          <Link href={`/admin/projects/${project.id}`}>
                            <Pencil className="size-4" />
                          </Link>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

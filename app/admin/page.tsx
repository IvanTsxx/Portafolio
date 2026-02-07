import { Briefcase, FileText, FolderKanban } from "lucide-react";
import { getExperiences } from "@/app/actions/experiences";
import { getPosts } from "@/app/actions/posts";
import { getProjects } from "@/app/actions/projects";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Vista general de tu portafolio</p>
      </div>

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
    </div>
  );
}

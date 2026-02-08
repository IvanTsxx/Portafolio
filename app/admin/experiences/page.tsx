import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Briefcase, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { getExperiences } from "@/app/actions/experiences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminExperiencesPage() {
  const experiences = await getExperiences({
    limit: 100,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Experiencias</h1>
          <p className="text-muted-foreground">
            Administra tu historial laboral
          </p>
        </div>
        <Button
          render={
            <Link href="/admin/experiences/new">
              <Plus className="mr-2 size-4" />
              Nueva experiencia
            </Link>
          }
        />
      </div>

      <div className="grid gap-6">
        {experiences.map((experience) => (
          <Card key={experience.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="size-5" />
                    <Link
                      href={`/admin/experiences/${experience.id}`}
                      className="hover:text-primary"
                    >
                      {experience.position}
                    </Link>
                    {experience.current && (
                      <Badge variant="default">Actual</Badge>
                    )}
                  </CardTitle>
                  <p className="font-medium text-muted-foreground">
                    {experience.company}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="size-4" />
                  <span>
                    {format(experience.startDate, "MMM yyyy", { locale: es })}
                    {" - "}
                    {experience.current
                      ? "Presente"
                      : experience.endDate
                        ? format(experience.endDate, "MMM yyyy", { locale: es })
                        : ""}
                  </span>
                </div>

                {experience.description && (
                  <p className="text-muted-foreground text-sm">
                    {experience.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {experience.technologies.slice(0, 6).map((tech) => (
                    <Badge key={tech.id} variant="secondary">
                      {tech.name}
                    </Badge>
                  ))}
                  {experience.technologies.length > 6 && (
                    <Badge variant="secondary">
                      +{experience.technologies.length - 6}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {experiences.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <p className="text-muted-foreground">
                No hay experiencias aún. Agrega tu primera experiencia laboral.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

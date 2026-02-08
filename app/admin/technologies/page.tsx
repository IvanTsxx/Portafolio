import { getTechnologies } from "@/app/actions/taxonamy";
import { TechnologiesList } from "./_components/technologies-list";

export default async function AdminTechnologiesPage() {
  const technologies = await getTechnologies();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Tecnologías</h1>
        <p className="text-muted-foreground">
          Administra las tecnologías de tus proyectos y experiencias
        </p>
      </div>

      <TechnologiesList initialTechnologies={technologies} />
    </div>
  );
}

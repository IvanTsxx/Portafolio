"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createTechnology, deleteTechnology } from "@/app/actions/taxonamy";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateSlug } from "@/lib/utils";

interface Technology {
  id: string;
  name: string;
  slug: string;
}

interface TechnologiesListProps {
  initialTechnologies: Technology[];
}

export function TechnologiesList({
  initialTechnologies,
}: TechnologiesListProps) {
  const [technologies, setTechnologies] =
    useState<Technology[]>(initialTechnologies);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        const newTech = await createTechnology({
          name: name.trim(),
          slug: generateSlug(name.trim()),
        });
        setTechnologies((prev) =>
          [...prev, newTech].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setName("");
        toast.success("Tecnología creada exitosamente");
      } catch {
        toast.error("Error al crear la tecnología");
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        await deleteTechnology(id);
        setTechnologies((prev) => prev.filter((t) => t.id !== id));
        toast.success("Tecnología eliminada exitosamente");
      } catch {
        toast.error(
          "Error al eliminar la tecnología. Puede tener proyectos asociados.",
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tecnologías ({technologies.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la tecnología"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !name.trim()}>
            <Plus className="mr-2 size-4" />
            Crear
          </Button>
        </form>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {technologies.map((technology) => (
            <div
              key={technology.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="font-medium">{technology.name}</span>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="ghost" size="sm" disabled={isPending}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar tecnología?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará la
                      tecnología "{technology.name}" permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(technology.id)}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {technologies.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              No hay tecnologías creadas aún.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

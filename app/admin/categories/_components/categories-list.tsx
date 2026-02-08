"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCategory, deleteCategory } from "@/app/actions/taxonamy";
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

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoriesListProps {
  initialCategories: Category[];
}

export function CategoriesList({ initialCategories }: CategoriesListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        const newCategory = await createCategory({
          name: name.trim(),
          slug: generateSlug(name.trim()),
        });
        setCategories((prev) =>
          [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setName("");
        toast.success("Categoría creada exitosamente");
      } catch {
        toast.error("Error al crear la categoría");
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success("Categoría eliminada exitosamente");
      } catch {
        toast.error(
          "Error al eliminar la categoría. Puede tener posts asociados.",
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías ({categories.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la categoría"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !name.trim()}>
            <Plus className="mr-2 size-4" />
            Crear
          </Button>
        </form>

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <span className="font-medium">{category.name}</span>
                <span className="ml-2 text-muted-foreground text-sm">
                  /{category.slug}
                </span>
              </div>
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
                    <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará la
                      categoría "{category.name}" permanentemente. Asegúrate de
                      que no tenga posts asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(category.id)}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {categories.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No hay categorías creadas aún.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

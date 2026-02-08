"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createTag, deleteTag } from "@/app/actions/taxonamy";
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

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagsListProps {
  initialTags: Tag[];
}

export function TagsList({ initialTags }: TagsListProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        const newTag = await createTag({
          name: name.trim(),
          slug: generateSlug(name.trim()),
        });
        setTags((prev) =>
          [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setName("");
        toast.success("Tag creado exitosamente");
      } catch {
        toast.error("Error al crear el tag");
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        await deleteTag(id);
        setTags((prev) => prev.filter((t) => t.id !== id));
        toast.success("Tag eliminado exitosamente");
      } catch {
        toast.error("Error al eliminar el tag");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags ({tags.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del tag"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !name.trim()}>
            <Plus className="mr-2 size-4" />
            Crear
          </Button>
        </form>

        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <span className="font-medium">{tag.name}</span>
                <span className="ml-2 text-muted-foreground text-sm">
                  /{tag.slug}
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
                    <AlertDialogTitle>¿Eliminar tag?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará el tag "
                      {tag.name}" permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(tag.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {tags.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No hay tags creados aún.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

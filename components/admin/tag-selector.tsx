"use client";

import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createTag } from "@/app/actions/taxonamy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateSlug } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: string[];
  onSelectionChange: (tagIds: string[]) => void;
  onTagCreated?: (tag: Tag) => void;
}

export function TagSelector({
  tags,
  selectedTagIds,
  onSelectionChange,
  onTagCreated,
}: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localTags, setLocalTags] = useState<Tag[]>(tags);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectionChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onSelectionChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const existingTag = localTags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase(),
    );
    if (existingTag) {
      if (!selectedTagIds.includes(existingTag.id)) {
        onSelectionChange([...selectedTagIds, existingTag.id]);
      }
      setNewTagName("");
      return;
    }

    startTransition(async () => {
      try {
        const newTag = await createTag({
          name: newTagName.trim(),
          slug: generateSlug(newTagName.trim()),
        });
        setLocalTags((prev) =>
          [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)),
        );
        onSelectionChange([...selectedTagIds, newTag.id]);
        onTagCreated?.(newTag);
        setNewTagName("");
        toast.success(`Tag "${newTag.name}" creado`);
      } catch {
        toast.error("Error al crear el tag");
      }
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateTag} className="flex gap-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Escribir para crear nuevo tag..."
          disabled={isPending}
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !newTagName.trim()}
        >
          <Plus className="mr-1 size-4" />
          Crear
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {localTags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="group"
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-primary/80"
              >
                {tag.name}
                {isSelected && <X className="ml-1 size-3" />}
              </Badge>
            </button>
          );
        })}
        {localTags.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No hay tags. Escribe arriba para crear uno.
          </p>
        )}
      </div>
    </div>
  );
}

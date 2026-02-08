"use client";

import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePost, updatePost } from "@/app/actions/posts";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { generateSlug } from "@/lib/utils";
import { postSchema } from "@/lib/validations";

interface Tag {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  published: boolean;
  categoryId: string | null;
  tags: Tag[];
}

interface EditPostFormProps {
  post: Post;
  categories: Category[];
  tags: Tag[];
}

export function EditPostForm({ post, categories, tags }: EditPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [description, setDescription] = useState(post.description || "");
  const [content, setContent] = useState(post.content);
  const [published, setPublished] = useState(post.published);
  const [categoryId, setCategoryId] = useState(post.categoryId || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post.tags.map((t) => t.id),
  );
  const [slugEdited, setSlugEdited] = useState(true);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(value);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = postSchema.parse({
        title,
        slug,
        description,
        content,
        published,
        categoryId: categoryId || null,
        tagIds: selectedTags,
      });

      startTransition(async () => {
        await updatePost(post.id, data);
        toast.success("Post actualizado exitosamente");
        router.push("/admin/posts");
        router.refresh();
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al actualizar el post");
      }
    }
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deletePost(post.id);
        toast.success("Post eliminado exitosamente");
        router.push("/admin/posts");
        router.refresh();
      } catch {
        toast.error("Error al eliminar el post");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            render={
              <Link href="/admin/posts">
                <ArrowLeft className="mr-2 size-4" />
                Volver
              </Link>
            }
          />

          <div>
            <h1 className="font-bold text-3xl tracking-tight">Editar post</h1>
            <p className="text-muted-foreground">{post.title}</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" disabled={isPending}>
                <Trash2 className="mr-2 size-4" />
                Eliminar
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar post?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará el post "
                {post.title}" permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título del post"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="titulo-del-post"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del post"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Publicado</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedTags.includes(tag.id)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No hay tags. Créalos primero en la sección de Tags.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Escribe tu post en markdown..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/admin/posts">Cancelar</Link>}
          />

          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 size-4" />
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}

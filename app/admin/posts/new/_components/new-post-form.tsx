"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createPost } from "@/app/actions/posts";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { TagSelector } from "@/components/admin/tag-selector";
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
  slug: string;
}

interface Category {
  id: string;
  name: string;
}

interface NewPostFormProps {
  tags: Tag[];
  categories: Category[];
}

export function NewPostForm({ tags, categories }: NewPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-generate slug from title
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = postSchema.parse({
        title,
        slug,
        description,
        content,
        coverImage: coverImage || null,
        published,
        categoryId: categoryId || null,
        tagIds: selectedTags,
      });

      startTransition(async () => {
        await createPost(data);
        toast.success("Post creado exitosamente");
        router.push("/admin/posts");
        router.refresh();
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al crear el post");
      }
    }
  };

  return (
    <div className="space-y-8">
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
          <h1 className="font-bold text-3xl tracking-tight">Nuevo post</h1>
          <p className="text-muted-foreground">
            Crea un nuevo artículo para tu blog
          </p>
        </div>
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
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del post"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Imagen de portada (URL)</Label>
              <Input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
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
              <Label htmlFor="published">Publicar inmediatamente</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <TagSelector
              tags={tags}
              selectedTagIds={selectedTags}
              onSelectionChange={setSelectedTags}
            />
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
              placeholder="Escribe tu contenido en Markdown..."
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
            {isPending ? "Guardando..." : "Guardar post"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import {
  ArrowLeft,
  Folder,
  Globe,
  Image as ImageIcon,
  Loader2,
  Save,
  Tags,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePost, updatePost } from "@/app/actions/posts";
import { createCategory, createTag } from "@/app/actions/taxonamy";
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
import { CategoryInput } from "@/components/ui/category-input";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
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

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  categoryId: string | null;
  tags: Tag[];
}

interface EditPostFormProps {
  post: Post;
  categories: Category[];
  tags: Tag[];
}

export function EditPostForm({
  post,
  categories: initialCategories,
  tags: initialTags,
}: EditPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [description, setDescription] = useState(post.description || "");
  const [content, setContent] = useState(post.content);
  const [coverImage, setCoverImage] = useState(post.coverImage || "");
  const [published, setPublished] = useState(post.published);
  const [categoryId, setCategoryId] = useState(post.categoryId || "");

  const [selectedTags, setSelectedTags] = useState<Tag[]>(post.tags);
  const [availableTags, setAvailableTags] = useState<Tag[]>(initialTags);
  const [availableCategories, setAvailableCategories] =
    useState<Category[]>(initialCategories);

  const [slugEdited, setSlugEdited] = useState(true);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleCreateTag = async (name: string) => {
    const slug = generateSlug(name);
    const newTag = await createTag({ name, slug });
    setAvailableTags((prev) =>
      [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return newTag;
  };

  const handleCreateCategory = async (name: string) => {
    const slug = generateSlug(name);
    const newCategory = await createCategory({ name, slug });
    setAvailableCategories((prev) =>
      [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return newCategory;
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
        tagIds: selectedTags.map((t) => t.id),
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
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="font-medium text-muted-foreground text-sm">
            Editar Artículo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="mr-4 flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5">
            <div
              className={`h-2 w-2 rounded-full ${published ? "bg-green-500 shadow-green-500/50 shadow-sm" : "bg-amber-500"}`}
            />
            <span className="font-medium text-muted-foreground text-xs">
              {published ? "Publicado" : "Borrador"}
            </span>
            <Switch
              checked={published}
              onCheckedChange={setPublished}
              className="ml-1 scale-75"
            />
          </div>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={isPending}
                  className="mr-2 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
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

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            size="sm"
            className="font-medium"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Guardar
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Document Header */}
        <div className="group relative mb-8 space-y-2">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Título del Artículo"
            className="h-auto border-none bg-transparent px-0 py-2 font-bold text-4xl tracking-tight shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 md:text-5xl"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escribe una breve introducción o subtítulo..."
            className="min-h-[60px] resize-none border-none bg-transparent px-0 text-muted-foreground text-xl shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0"
          />
        </div>

        {/* Properties Panel (Notion-style) */}
        <div className="mb-10 space-y-10">
          <div className="grid gap-y-1">
            {/* Category */}
            <div className="grid grid-cols-[140px_1fr] items-baseline gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Folder className="h-4 w-4" />
                <span>Categoría</span>
              </div>
              <div className="min-w-0">
                <CategoryInput
                  categories={availableCategories}
                  value={categoryId}
                  onValueChange={setCategoryId}
                  onCreateCategory={handleCreateCategory}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="grid grid-cols-[140px_1fr] items-baseline gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Tags className="h-4 w-4" />
                <span>Etiquetas</span>
              </div>
              <div className="min-w-0">
                <TagInput
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  onCreateTag={handleCreateTag}
                />
              </div>
            </div>

            {/* Slug */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Globe className="h-4 w-4" />
                <span>Slug URL</span>
              </div>
              <div className="min-w-0">
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(e.target.value);
                  }}
                  className="h-8 border-none bg-transparent px-2 font-mono text-muted-foreground text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-0"
                  placeholder="url-amigable-del-post"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="grid grid-cols-[140px_1fr] items-start gap-4 py-1.5">
              <div className="flex items-center gap-2 pt-1.5 text-muted-foreground text-sm">
                <ImageIcon className="h-4 w-4" />
                <span>Portada</span>
              </div>
              <div className="min-w-0 space-y-3">
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="h-8 border-none bg-transparent px-2 text-muted-foreground text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-0"
                  placeholder="https://..."
                />
                {coverImage && (
                  <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border bg-muted shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Content Editor */}
        <div className="min-h-[500px]">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Comienza a escribir tu historia..."
          />
        </div>
      </div>
    </div>
  );
}

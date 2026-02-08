"use client";

import {
  ArrowLeft,
  Folder,
  Github,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
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
import { deleteProject, updateProject } from "@/app/actions/projects";
import { createTechnology } from "@/app/actions/taxonamy";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug } from "@/lib/utils";
import { projectSchema } from "@/lib/validations";

interface Technology {
  id: string;
  name: string;
  slug: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  coverImage: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  published: boolean;
  featured: boolean;
  technologies: Technology[];
}

interface EditProjectFormProps {
  project: Project;
  technologies: Technology[];
}

export function EditProjectForm({
  project,
  technologies: initialTechnologies,
}: EditProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [description, setDescription] = useState(project.description);
  const [content, setContent] = useState(project.content);
  const [image, setImage] = useState(project.coverImage);
  const [githubUrl, setGithubUrl] = useState(project.githubUrl || "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || "");
  const [published, setPublished] = useState(project.published);
  const [featured, setFeatured] = useState(project.featured);

  const [selectedTechnologies, setSelectedTechnologies] = useState<
    Technology[]
  >(project.technologies);
  const [availableTechnologies, setAvailableTechnologies] =
    useState<Technology[]>(initialTechnologies);

  const [slugEdited, setSlugEdited] = useState(true);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleCreateTechnology = async (name: string) => {
    const slug = generateSlug(name);
    const newTech = await createTechnology({ name, slug });
    setAvailableTechnologies((prev) =>
      [...prev, newTech].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return newTech;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = projectSchema.parse({
        title,
        slug,
        description,
        content,
        coverImage: image,
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        published,
        featured,
        technologyIds: selectedTechnologies.map((t) => t.id),
      });

      startTransition(async () => {
        await updateProject(project.id, data);
        toast.success("Proyecto actualizado exitosamente");
        router.push("/admin/projects");
        router.refresh();
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al actualizar el proyecto");
      }
    }
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Proyecto eliminado exitosamente");
        router.push("/admin/projects");
        router.refresh();
      } catch {
        toast.error("Error al eliminar el proyecto");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="font-medium text-muted-foreground text-sm">
            Editar Proyecto
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
                <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará el proyecto "
                  {project.title}" permanentemente.
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
            placeholder="Nombre del Proyecto"
            className="h-auto border-none bg-transparent px-0 py-2 font-bold text-4xl tracking-tight shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 md:text-5xl"
          />
          <Textarea
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción corta del proyecto..."
            className="min-h-[60px] resize-none border-none bg-transparent px-0 text-muted-foreground text-xl shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0"
          />
        </div>

        {/* Properties Panel (Notion-style) */}
        <div className="mb-10 space-y-10">
          <div className="grid gap-y-1">
            {/* Stack (Tags) */}
            <div className="grid grid-cols-[140px_1fr] items-baseline gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Tags className="h-4 w-4" />
                <span>Stack</span>
              </div>
              <div className="min-w-0">
                <TagInput
                  placeholder="Tecnologías usadas..."
                  availableTags={availableTechnologies}
                  selectedTags={selectedTechnologies}
                  onTagsChange={setSelectedTechnologies}
                  onCreateTag={handleCreateTechnology}
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
                  placeholder="url-del-proyecto"
                />
              </div>
            </div>

            {/* GitHub */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Github className="h-4 w-4" />
                <span>Repositorio</span>
              </div>
              <div className="min-w-0">
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="h-8 border-none bg-transparent px-2 text-muted-foreground text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-0"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {/* Demo */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <LinkIcon className="h-4 w-4" />
                <span>Demo URL</span>
              </div>
              <div className="min-w-0">
                <Input
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="h-8 border-none bg-transparent px-2 text-muted-foreground text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-0"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Featured Switch */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Folder className="h-4 w-4" />
                <span>Destacado</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={featured} onCheckedChange={setFeatured} />
                <span className="text-muted-foreground text-xs">
                  {featured ? "Sí, mostrar en home" : "No, listar normal"}
                </span>
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
                  value={image || ""}
                  onChange={(e) => setImage(e.target.value)}
                  className="h-8 border-none bg-transparent px-2 text-muted-foreground text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-0"
                  placeholder="https://..."
                />
                {image && (
                  <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border bg-muted shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
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
            placeholder="Detalles técnicos, proceso de desarrollo, lecciones aprendidas..."
          />
        </div>
      </div>
    </div>
  );
}

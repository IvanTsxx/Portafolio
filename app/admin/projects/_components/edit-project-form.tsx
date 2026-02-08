"use client";

import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProject, updateProject } from "@/app/actions/projects";
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
import { projectSchema } from "@/lib/validations";

interface Technology {
  id: string;
  name: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  image: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  published: boolean;
  technologies: Technology[];
}

interface EditProjectFormProps {
  project: Project;
  technologies: Technology[];
}

export function EditProjectForm({
  project,
  technologies,
}: EditProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [description, setDescription] = useState(project.description || "");
  const [content, setContent] = useState(project.content);
  const [coverImage, setCoverImage] = useState(project.coverImage || "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || "");
  const [githubUrl, setGithubUrl] = useState(project.githubUrl || "");
  const [featured, setFeatured] = useState(project.featured);
  const [published, setPublished] = useState(project.published);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    project.technologies.map((t) => t.id),
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

  const toggleTech = (techId: string) => {
    setSelectedTechs((prev) =>
      prev.includes(techId)
        ? prev.filter((id) => id !== techId)
        : [...prev, techId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = projectSchema.parse({
        title,
        slug,
        description,
        content,
        coverImage: coverImage || null,
        demoUrl: demoUrl || null,
        githubUrl: githubUrl || null,
        featured,
        published,
        technologyIds: selectedTechs,
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            render={
              <Link href="/admin/projects">
                <ArrowLeft className="mr-2 size-4" />
                Volver
              </Link>
            }
          />

          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Editar proyecto
            </h1>
            <p className="text-muted-foreground">{project.title}</p>
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
                placeholder="Título del proyecto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="titulo-del-proyecto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del proyecto"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo URL</Label>
                <Input
                  id="demoUrl"
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
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

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
                <Label htmlFor="featured">Destacar proyecto</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label htmlFor="published">Publicado</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tecnologías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => toggleTech(tech.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedTechs.includes(tech.id)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {tech.name}
                </button>
              ))}
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
              placeholder="Describe tu proyecto en detalle..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/admin/projects">Cancelar</Link>}
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

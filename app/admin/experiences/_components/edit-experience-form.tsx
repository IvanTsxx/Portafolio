"use client";

import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteExperience, updateExperience } from "@/app/actions/experiences";
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
import { experienceSchema } from "@/lib/validations";

interface Technology {
  id: string;
  name: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  description: string | null;
  content: string;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  technologies: Technology[];
}

interface EditExperienceFormProps {
  experience: Experience;
  technologies: Technology[];
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function EditExperienceForm({
  experience,
  technologies,
}: EditExperienceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [company, setCompany] = useState(experience.company);
  const [position, setPosition] = useState(experience.position);
  const [description, setDescription] = useState(experience.description || "");
  const [content, setContent] = useState(experience.content);
  const [startDate, setStartDate] = useState(
    formatDateForInput(experience.startDate),
  );
  const [endDate, setEndDate] = useState(
    experience.endDate ? formatDateForInput(experience.endDate) : "",
  );
  const [current, setCurrent] = useState(experience.current);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    experience.technologies.map((t) => t.id),
  );

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
      const data = experienceSchema.parse({
        company,
        position,
        description,
        content,
        startDate: new Date(startDate),
        endDate: current ? null : endDate ? new Date(endDate) : null,
        current,
        technologyIds: selectedTechs,
      });

      startTransition(async () => {
        await updateExperience(experience.id, data);
        toast.success("Experiencia actualizada exitosamente");
        router.push("/admin/experiences");
        router.refresh();
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al actualizar la experiencia");
      }
    }
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteExperience(experience.id);
        toast.success("Experiencia eliminada exitosamente");
        router.push("/admin/experiences");
        router.refresh();
      } catch {
        toast.error("Error al eliminar la experiencia");
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
              <Link href="/admin/experiences">
                <ArrowLeft className="mr-2 size-4" />
                Volver
              </Link>
            }
          />

          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Editar experiencia
            </h1>
            <p className="text-muted-foreground">
              {experience.position} en {experience.company}
            </p>
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
              <AlertDialogTitle>¿Eliminar experiencia?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará la experiencia en
                "{experience.company}" permanentemente.
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nombre de la empresa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Posición *</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Tu cargo o rol"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción breve</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Una línea describiendo tu rol"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={current}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2 pb-2">
                  <Switch
                    id="current"
                    checked={current}
                    onCheckedChange={setCurrent}
                  />
                  <Label htmlFor="current">Trabajo actual</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tecnologías utilizadas</CardTitle>
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
            <CardTitle>Contenido detallado</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Describe tus responsabilidades, logros y proyectos destacados..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/admin/experiences">Cancelar</Link>}
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

"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createExperience } from "@/app/actions/experiences";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
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

interface ExperienceFormProps {
  technologies: Technology[];
}

export function ExperienceForm({ technologies }: ExperienceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

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
        await createExperience(data);
        toast.success("Experiencia creada exitosamente");
        router.push("/admin/experiences");
        router.refresh();
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al crear la experiencia");
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
            <Link href="/admin/experiences">
              <ArrowLeft className="mr-2 size-4" />
              Volver
            </Link>
          }
        />

        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Nueva experiencia
          </h1>
          <p className="text-muted-foreground">
            Agrega una nueva experiencia laboral
          </p>
        </div>
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
              {technologies.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No hay tecnologías. Créalas primero en la sección de
                  Tecnologías.
                </p>
              )}
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
            {isPending ? "Guardando..." : "Guardar experiencia"}
          </Button>
        </div>
      </form>
    </div>
  );
}

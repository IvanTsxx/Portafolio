"use client";

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Folder,
  Loader2,
  Save,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createExperience } from "@/app/actions/experiences";
import { createTechnology } from "@/app/actions/taxonamy";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug } from "@/lib/utils";
import { experienceSchema } from "@/lib/validations";

interface Technology {
  id: string;
  name: string;
  slug: string;
}

interface ExperienceFormProps {
  technologies: Technology[];
}

export function ExperienceForm({
  technologies: initialTechnologies,
}: ExperienceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);

  const [selectedTechnologies, setSelectedTechnologies] = useState<
    Technology[]
  >([]);
  const [availableTechnologies, setAvailableTechnologies] =
    useState<Technology[]>(initialTechnologies);

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
      const data = experienceSchema.parse({
        company,
        position,
        description,
        content,
        startDate: new Date(startDate),
        endDate: current ? null : endDate ? new Date(endDate) : null,
        current,
        technologyIds: selectedTechnologies.map((t) => t.id),
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
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-4">
          <Link href="/admin/experiences">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="font-medium text-muted-foreground text-sm">
            Nueva Experiencia
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            size="sm"
            className="font-medium"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Document Header */}
        <div className="group relative mb-8 space-y-2">
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Cargo / Posición"
            className="h-auto border-none bg-transparent px-0 py-2 font-bold text-4xl tracking-tight shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 md:text-5xl"
            autoFocus
          />
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Empresa / Organización"
            className="h-auto border-none bg-transparent px-0 font-semibold text-2xl text-muted-foreground shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del rol..."
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
                <span>Stack Tecnológico</span>
              </div>
              <div className="min-w-0">
                <TagInput
                  placeholder="Tecnologías utilizadas..."
                  availableTags={availableTechnologies}
                  selectedTags={selectedTechnologies}
                  onTagsChange={setSelectedTechnologies}
                  onCreateTag={handleCreateTechnology}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>Período</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 w-auto min-w-[150px] border-none bg-transparent px-2 text-muted-foreground text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-0"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={current}
                    className="h-8 w-auto min-w-[150px] border-none bg-transparent px-2 text-muted-foreground text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-0 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Current Job */}
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 py-1.5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Briefcase className="h-4 w-4" />
                <span>Trabajo Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={current} onCheckedChange={setCurrent} />
                <span className="text-muted-foreground text-xs">
                  {current ? "Sí, actualmente aquí" : "No, finalizado"}
                </span>
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
            placeholder="Detalla tus logros, responsabilidades y proyectos clave..."
          />
        </div>
      </div>
    </div>
  );
}

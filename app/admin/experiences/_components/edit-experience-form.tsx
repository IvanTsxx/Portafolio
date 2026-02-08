"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Briefcase,
  Calendar as CalendarIcon,
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
import { deleteExperience, updateExperience } from "@/app/actions/experiences";
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
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { cn, generateSlug } from "@/lib/utils";
import { experienceSchema } from "@/lib/validations";

interface Technology {
  id: string;
  name: string;
  slug: string;
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

export function EditExperienceForm({
  experience,
  technologies: initialTechnologies,
}: EditExperienceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [company, setCompany] = useState(experience.company);
  const [position, setPosition] = useState(experience.position);
  const [description, setDescription] = useState(experience.description || "");
  const [content, setContent] = useState(experience.content);
  const [startDate, setStartDate] = useState<Date | undefined>(
    experience.startDate,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    experience.endDate || undefined,
  );
  const [current, setCurrent] = useState(experience.current);

  const [selectedTechnologies, setSelectedTechnologies] = useState<
    Technology[]
  >(experience.technologies);
  const [availableTechnologies, setAvailableTechnologies] =
    useState<Technology[]>(initialTechnologies);

  const handleCreateTechnology = async (name: string) => {
    const slug = generateSlug(name);
    // Cast to match TagInput expectation
    const newTech = await createTechnology({ name, slug });
    setAvailableTechnologies((prev) =>
      [...prev, newTech].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return newTech;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate) {
      toast.error("La fecha de inicio es requerida");
      return;
    }

    try {
      const data = experienceSchema.parse({
        company,
        position,
        description,
        content,
        startDate,
        endDate: current ? null : endDate,
        current,
        technologyIds: selectedTechnologies.map((t) => t.id),
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
            Editar Experiencia
          </span>
        </div>

        <div className="flex items-center gap-2">
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
                <AlertDialogTitle>¿Eliminar experiencia?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará la experiencia
                  en "{experience.company}" permanentemente.
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
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Cargo / Posición"
            className="h-auto border-none bg-transparent px-0 py-2 font-bold text-4xl tracking-tight shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 md:text-5xl"
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
                <CalendarIcon className="h-4 w-4" />
                <span>Período</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-8 w-[160px] justify-start border-dashed text-left font-normal text-xs",
                            !startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {startDate ? (
                            format(startDate, "PPP", { locale: es })
                          ) : (
                            <span>Fecha inicio</span>
                          )}
                        </Button>
                      }
                    />

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-muted-foreground text-xs">-</span>

                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant={"outline"}
                          disabled={current}
                          className={cn(
                            "h-8 w-[160px] justify-start border-dashed text-left font-normal text-xs",
                            !endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {endDate ? (
                            format(endDate, "PPP", { locale: es })
                          ) : (
                            <span>Fecha fin</span>
                          )}
                        </Button>
                      }
                    />

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
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
                <Switch
                  checked={current}
                  onCheckedChange={(checked) => {
                    setCurrent(checked);
                    if (checked) setEndDate(undefined);
                  }}
                />
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

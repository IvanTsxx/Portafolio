import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  slug: z.string().min(1, "El slug es requerido").max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe estar en formato kebab-case"),
  description: z.string().min(1, "La descripción es requerida").max(500),
  content: z.string().min(1, "El contenido es requerido"),
  coverImage: z.string().url("Debe ser una URL válida").optional().nullable(),
  published: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  slug: z.string().min(1, "El slug es requerido").max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe estar en formato kebab-case"),
  description: z.string().min(1, "La descripción es requerida").max(500),
  content: z.string().min(1, "El contenido es requerido"),
  coverImage: z.string().url("Debe ser una URL válida").optional().nullable(),
  demoUrl: z.string().url("Debe ser una URL válida").optional().nullable(),
  githubUrl: z.string().url("Debe ser una URL válida").optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  technologyIds: z.array(z.string()).default([]),
});

export const experienceSchema = z.object({
  company: z.string().min(1, "La empresa es requerida").max(200),
  position: z.string().min(1, "El puesto es requerido").max(200),
  description: z.string().min(1, "La descripción es requerida"),
  content: z.string().min(1, "El contenido es requerido"),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  current: z.boolean().default(false),
  companyUrl: z.string().url("Debe ser una URL válida").optional().nullable(),
  technologyIds: z.array(z.string()).default([]),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  slug: z.string().min(1, "El slug es requerido").max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe estar en formato kebab-case"),
});

export const tagSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  slug: z.string().min(1, "El slug es requerido").max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe estar en formato kebab-case"),
});

export const technologySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  slug: z.string().min(1, "El slug es requerido").max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe estar en formato kebab-case"),
});

export type PostInput = z.infer<typeof postSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type TechnologyInput = z.infer<typeof technologySchema>;

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { ProjectWithRelations } from "@/lib/types";
import { type ProjectInput, projectSchema } from "@/lib/validations";

export async function createProject(data: ProjectInput) {
  await requireAuth();

  const validated = projectSchema.parse(data);

  const project = await prisma.project.create({
    data: {
      title: validated.title,
      slug: validated.slug,
      description: validated.description,
      content: validated.content,
      coverImage: validated.coverImage,
      demoUrl: validated.demoUrl,
      githubUrl: validated.githubUrl,
      featured: validated.featured,
      published: validated.published,
      technologies: {
        connect: validated.technologyIds.map((id) => ({ id })),
      },
    },
    include: {
      technologies: true,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/admin/projects");

  return project;
}

export async function updateProject(id: string, data: ProjectInput) {
  await requireAuth();

  const validated = projectSchema.parse(data);

  const project = await prisma.project.update({
    where: { id },
    data: {
      title: validated.title,
      slug: validated.slug,
      description: validated.description,
      content: validated.content,
      coverImage: validated.coverImage,
      demoUrl: validated.demoUrl,
      githubUrl: validated.githubUrl,
      featured: validated.featured,
      published: validated.published,
      technologies: {
        set: validated.technologyIds.map((id) => ({ id })),
      },
    },
    include: {
      technologies: true,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${validated.slug}`);
  revalidatePath("/admin/projects");

  return project;
}

export async function deleteProject(id: string) {
  await requireAuth();

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/projects");
  revalidatePath("/admin/projects");
}

export async function getProject(
  slug: string,
): Promise<ProjectWithRelations | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      technologies: true,
    },
  });

  return project;
}

export async function getProjectById(
  id: string,
): Promise<ProjectWithRelations | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      technologies: true,
    },
  });

  return project;
}

export async function getProjects(
  published = true,
): Promise<ProjectWithRelations[]> {
  const projects = await prisma.project.findMany({
    where: published ? { published: true } : undefined,
    include: {
      technologies: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

export async function toggleProjectPublish(id: string) {
  await requireAuth();

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new Error("Proyecto no encontrado");
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      published: !project.published,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/admin/projects");

  return updated;
}

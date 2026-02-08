"use server";

import { revalidatePath } from "next/cache";
import { generateProjectEmbeddings } from "@/lib/actions/portfolio";
import { requireAuth } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { ProjectWithRelations } from "@/lib/types";
import { type ProjectInput, projectSchema } from "@/lib/validations";

export async function createProject(data: ProjectInput) {
  await requireAuth();

  const validated = projectSchema.parse(data);

  /* 1. Ensure unique slug */
  let slug = validated.slug;
  let counter = 1;
  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${validated.slug}-${counter}`;
    counter++;
  }

  const project = await prisma.project.create({
    data: {
      title: validated.title,
      slug: slug,
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

  // 2. ✅ Embedding se crea AUTOMÁTICAMENTE
  await generateProjectEmbeddings(project.id);

  revalidatePath("/projects");
  revalidatePath("/admin/projects");

  return project;
}

export async function updateProject(id: string, data: ProjectInput) {
  await requireAuth();

  const validated = projectSchema.parse(data);

  // Obtener proyecto anterior para comparar
  const previousProject = await prisma.project.findUnique({
    where: { id },
    select: { content: true, published: true },
  });

  /* Ensure unique slug (excluding current project) */
  let slug = validated.slug;
  let counter = 1;
  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === id) {
      break;
    }
    slug = `${validated.slug}-${counter}`;
    counter++;
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      title: validated.title,
      slug: slug,
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

  // ✅ Regenerar embeddings solo si:
  // 1. Cambió el contenido, O
  // 2. Se publicó (antes no publicado → ahora publicado)
  const contentChanged = previousProject?.content !== validated.content;
  const wasPublished =
    previousProject?.published === false && validated.published === true;

  if (project.published && (contentChanged || wasPublished)) {
    await generateProjectEmbeddings(project.id);
  }

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

export async function getProjects({
  limit = 4,
}: {
  limit?: number;
}): Promise<ProjectWithRelations[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    ...(limit && { take: limit }),
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

  const newPublishedState = !project.published;

  const updated = await prisma.project.update({
    where: { id },
    data: {
      published: newPublishedState,
    },
  });

  // ✅ Lógica inteligente:
  // - Si se publica: generar embeddings
  // - Si se despublica: eliminar embeddings (opcional, o dejarlos)
  if (newPublishedState && project.content) {
    // Acaba de publicarse → generar embeddings
    await generateProjectEmbeddings(project.id);
  } else if (!newPublishedState) {
    // Se despublicó → eliminar embeddings (opcional)
    // await deleteProjectEmbeddings(project.id); // Si implementas esta función
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/admin/projects");

  return updated;
}

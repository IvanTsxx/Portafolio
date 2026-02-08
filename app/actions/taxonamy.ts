"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  type CategoryInput,
  categorySchema,
  type TagInput,
  type TechnologyInput,
  tagSchema,
  technologySchema,
} from "@/lib/validations";

// Categories
export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(data: CategoryInput) {
  await requireAuth();
  const validated = categorySchema.parse(data);

  const category = await prisma.category.create({
    data: validated,
  });

  revalidatePath("/admin/categories");
  return category;
}

export async function deleteCategory(id: string) {
  await requireAuth();

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/admin/categories");
}

// Tags
export async function getTags() {
  return await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTag(data: TagInput) {
  await requireAuth();
  const validated = tagSchema.parse(data);

  const existing = await prisma.tag.findFirst({
    where: {
      OR: [{ name: validated.name }, { slug: validated.slug }],
    },
  });

  if (existing) {
    return existing;
  }

  const tag = await prisma.tag.create({
    data: validated,
  });

  revalidatePath("/admin/tags");
  return tag;
}

export async function deleteTag(id: string) {
  await requireAuth();

  await prisma.tag.delete({
    where: { id },
  });

  revalidatePath("/admin/tags");
}

// Technologies
export async function getTechnologies() {
  return await prisma.technology.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTechnology(data: TechnologyInput) {
  await requireAuth();
  const validated = technologySchema.parse(data);

  const existing = await prisma.technology.findFirst({
    where: {
      OR: [{ name: validated.name }, { slug: validated.slug }],
    },
  });

  if (existing) {
    return existing;
  }

  const technology = await prisma.technology.create({
    data: validated,
  });

  revalidatePath("/admin/technologies");
  return technology;
}

export async function deleteTechnology(id: string) {
  await requireAuth();

  await prisma.technology.delete({
    where: { id },
  });

  revalidatePath("/admin/technologies");
}

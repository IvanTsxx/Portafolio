"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { ExperienceWithRelations } from "@/lib/types";
import { type ExperienceInput, experienceSchema } from "@/lib/validations";

export async function createExperience(data: ExperienceInput) {
  await requireAuth();

  const validated = experienceSchema.parse(data);

  const experience = await prisma.experience.create({
    data: {
      company: validated.company,
      position: validated.position,
      description: validated.description,
      content: validated.content,
      startDate: validated.startDate,
      endDate: validated.endDate,
      current: validated.current,
      slug: generateSlug(validated.company),
      technologies: {
        connect: validated.technologyIds.map((id) => ({ id })),
      },
    },
    include: {
      technologies: true,
    },
  });

  revalidatePath("/experience");
  revalidatePath("/admin/experiences");

  return experience;
}

export async function updateExperience(id: string, data: ExperienceInput) {
  await requireAuth();

  const validated = experienceSchema.parse(data);

  const experience = await prisma.experience.update({
    where: { id },
    data: {
      company: validated.company,
      position: validated.position,
      description: validated.description,
      content: validated.content,
      startDate: validated.startDate,
      endDate: validated.endDate,
      current: validated.current,
      slug: generateSlug(validated.company),
      technologies: {
        set: validated.technologyIds.map((id) => ({ id })),
      },
    },
    include: {
      technologies: true,
    },
  });

  revalidatePath("/experience");
  revalidatePath("/admin/experiences");

  return experience;
}

export async function deleteExperience(id: string) {
  await requireAuth();

  await prisma.experience.delete({
    where: { id },
  });

  revalidatePath("/experience");
  revalidatePath("/admin/experiences");
}

export async function getExperiences(): Promise<ExperienceWithRelations[]> {
  const experiences = await prisma.experience.findMany({
    include: {
      technologies: true,
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return experiences;
}

export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

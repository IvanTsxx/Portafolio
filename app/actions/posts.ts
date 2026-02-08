"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { PostWithRelations } from "@/lib/types";
import { type PostInput, postSchema } from "@/lib/validations";

export async function createPost(data: PostInput) {
  await requireAuth();

  const validated = postSchema.parse(data);

  const post = await prisma.post.create({
    data: {
      title: validated.title,
      slug: validated.slug,
      description: validated.description,
      content: validated.content,
      published: validated.published,
      categoryId: validated.categoryId || "",
      tags: {
        connect: validated.tagIds.map((id) => ({ id })),
      },
    },
    include: {
      tags: true,
      category: true,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/posts");

  return post;
}

export async function updatePost(id: string, data: PostInput) {
  await requireAuth();

  const validated = postSchema.parse(data);

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: validated.title,
      slug: validated.slug,
      description: validated.description,
      content: validated.content,
      published: validated.published,
      categoryId: validated.categoryId || "",
      tags: {
        set: validated.tagIds.map((id) => ({ id })),
      },
    },
    include: {
      tags: true,
      category: true,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${validated.slug}`);
  revalidatePath("/admin/posts");

  return post;
}

export async function deletePost(id: string) {
  await requireAuth();

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
}

export async function getPost(slug: string): Promise<PostWithRelations | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      tags: true,
      category: true,
    },
  });

  return post;
}

export async function getPostById(
  id: string,
): Promise<PostWithRelations | null> {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: true,
      category: true,
    },
  });

  return post;
}

export async function getPosts({
  limit = 10,
}: {
  limit?: number;
}): Promise<PostWithRelations[]> {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    take: limit,
    include: {
      tags: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return posts;
}

export async function togglePostPublish(id: string) {
  await requireAuth();

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new Error("Post no encontrado");
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      published: !post.published,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/posts");

  return updated;
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment too long"),
  parentId: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
});

export async function createComment(values: z.infer<typeof commentSchema>) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) {
    return { error: "You must be signed in to comment" };
  }

  // Resolve userId: look up by email for regular users,
  // or use session id directly for anonymous users.
  // If the user doesn't exist in Prisma yet (race condition
  // with anonymous sign-in), create it on the fly.
  let userId: string | null = null;

  if (session.user.email) {
    // Regular user - find by email
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    userId = existingUser?.id ?? null;
  } else {
    // Anonymous user - try to find by id first, create if missing
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // User session exists but not in DB yet — create it with placeholder email
      const created = await prisma.user.create({
        data: {
          email: `anonymous-${session.user.id}@localhost`,
          id: session.user.id,
          isAnonymous: true,
          name: session.user.name ?? "Guest",
        },
      });
      userId = created.id;
    }
  }

  if (!userId) {
    return { error: "User not found" };
  }

  const validated = commentSchema.safeParse(values);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { content, slug, parentId } = validated.data;

  try {
    const comment = await prisma.comment.create({
      data: {
        authorId: userId,
        content,
        parentId: parentId || null,
        slug,
      },
      include: {
        author: {
          select: {
            id: true,
            image: true,
            isAnonymous: true,
            name: true,
          },
        },
        reactions: true,
      },
    });

    revalidatePath(`/thoughts/${slug}`);

    return { comment: formatComment(comment) };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { error: "Failed to create comment" };
  }
}

export async function getCommentsBySlug(slug: string) {
  const comments = await prisma.comment.findMany({
    include: {
      author: {
        select: {
          id: true,
          image: true,
          isAnonymous: true,
          name: true,
        },
      },
      reactions: true,
      replies: {
        include: {
          author: {
            select: {
              id: true,
              image: true,
              isAnonymous: true,
              name: true,
            },
          },
          reactions: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      parentId: null,
      slug,
    },
  });

  return { comments: comments.map(formatComment) };
}

const reactionSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  type: z.enum(["HEART_BLACK", "HEART_RED", "FIRE", "ROCKET", "THUMBS_UP"]),
});

export async function toggleReaction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) {
    return { error: "You must be signed in to react" };
  }

  // Resolve userId: look up by email for regular users,
  // or try to find/create for anonymous users.
  let userId: string | null = null;

  if (session.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    userId = existingUser?.id ?? null;
  } else {
    // Anonymous user - try to find by id first, create if missing
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const created = await prisma.user.create({
        data: {
          email: `anonymous-${session.user.id}@localhost`,
          id: session.user.id,
          isAnonymous: true,
          name: session.user.name ?? "Guest",
        },
      });
      userId = created.id;
    }
  }

  if (!userId) {
    return { error: "User not found" };
  }

  const rawData = {
    commentId: formData.get("commentId") as string,
    type: formData.get("type") as string,
  };

  const validated = reactionSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { commentId, type } = validated.data;

  try {
    const existing = await prisma.reaction.findFirst({
      where: {
        commentId,
        type,
        userId,
      },
    });

    if (existing) {
      await prisma.reaction.delete({
        where: { id: existing.id },
      });
      revalidatePath(`/thoughts`);
      return { removed: true, type };
    }

    await prisma.reaction.create({
      data: {
        commentId,
        type,
        userId,
      },
    });

    revalidatePath(`/thoughts`);
    return { added: true, type };
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return { error: "Failed to toggle reaction" };
  }
}

function getAuthorName(author: { name: string | null; isAnonymous: boolean }) {
  return author.isAnonymous ? "Guest" : (author.name ?? "Anonymous");
}

function formatComment(comment: {
  id: string;
  content: string;
  slug: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    isAnonymous: boolean;
  };
  replies?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      isAnonymous: boolean;
    };
    reactions: { type: string; userId: string }[];
    createdAt: Date;
  }[];
  reactions: { type: string; userId: string }[];
}) {
  return {
    authorId: comment.authorId,
    authorImage: comment.author.image,
    authorIsAnonymous: comment.author.isAnonymous,
    authorName: getAuthorName(comment.author),
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    id: comment.id,
    parentId: comment.parentId,
    reactions: formatReactions(comment.reactions),
    replies: comment.replies
      ? comment.replies.map((reply) => ({
          authorImage: reply.author.image,
          authorIsAnonymous: reply.author.isAnonymous,
          authorName: getAuthorName(reply.author),
          content: reply.content,
          createdAt: reply.createdAt.toISOString(),
          id: reply.id,
          reactions: formatReactions(reply.reactions),
          replies: [],
        }))
      : [],
    slug: comment.slug,
  };
}

function formatReactions(reactions: { type: string; userId: string }[]) {
  const counts: Record<string, number> = {};
  const users: Record<string, string[]> = {};

  for (const r of reactions) {
    const type = r.type.toLowerCase();
    counts[type] = (counts[type] ?? 0) + 1;
    if (!users[type]) users[type] = [];
    users[type].push(r.userId);
  }

  return Object.entries(counts).map(([type, count]) => ({
    count,
    type,
    users: users[type] ?? [],
  }));
}

// ============================================
// POST REACTIONS (for blog posts)
// ============================================

export async function getPostReactions(slug: string) {
  const reactions = await prisma.postReaction.findMany({
    where: { slug },
  });

  return formatPostReactions(reactions);
}

const postReactionSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["HEART_BLACK", "HEART_RED", "FIRE", "ROCKET", "THUMBS_UP"]),
});

export async function togglePostReaction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) {
    return { error: "You must be signed in to react" };
  }

  // Resolve userId: look up by email for regular users,
  // or try to find/create for anonymous users.
  let userId: string | null = null;

  if (session.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    userId = existingUser?.id ?? null;
  } else {
    // Anonymous user - try to find by id first, create if missing
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const created = await prisma.user.create({
        data: {
          email: `anonymous-${session.user.id}@localhost`,
          id: session.user.id,
          isAnonymous: true,
          name: session.user.name ?? "Guest",
        },
      });
      userId = created.id;
    }
  }

  if (!userId) {
    return { error: "User not found" };
  }

  const rawData = {
    slug: formData.get("slug") as string,
    type: formData.get("type") as string,
  };

  const validated = postReactionSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { slug, type } = validated.data;

  try {
    const existing = await prisma.postReaction.findFirst({
      where: {
        slug,
        type,
        userId,
      },
    });

    if (existing) {
      await prisma.postReaction.delete({
        where: { id: existing.id },
      });
      revalidatePath(`/thoughts/${slug}`);
      return { removed: true, type };
    }

    await prisma.postReaction.create({
      data: {
        slug,
        type,
        userId,
      },
    });

    revalidatePath(`/thoughts/${slug}`);
    return { added: true, type };
  } catch (error) {
    console.error("Error toggling post reaction:", error);
    return { error: "Failed to toggle reaction" };
  }
}

function formatPostReactions(reactions: { type: string; userId: string }[]) {
  const counts: Record<string, number> = {};
  const users: Record<string, string[]> = {};

  for (const r of reactions) {
    const type = r.type.toLowerCase();
    counts[type] = (counts[type] ?? 0) + 1;
    if (!users[type]) users[type] = [];
    users[type].push(r.userId);
  }

  return Object.entries(counts).map(([type, count]) => ({
    count,
    type,
    users: users[type] ?? [],
  }));
}

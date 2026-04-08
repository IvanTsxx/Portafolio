"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { ReactionType } from "@/app/generated/prisma/enums";
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

  if (session?.user.email) {
    // Regular user - find by email
    const existingUser = await prisma.user.findUnique({
      where: { email: session?.user.email },
    });
    userId = existingUser?.id ?? null;
  } else {
    // Anonymous user - try to find by id first, create if missing
    const existingUser = await prisma.user.findUnique({
      where: { id: session?.user.id },
    });
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // User session exists but not in DB yet — create it with placeholder email
      const created = await prisma.user.create({
        data: {
          email: `anonymous-${session?.user.id}@localhost`,
          id: session?.user.id,
          isAnonymous: true,
          name: session?.user.name ?? "Guest",
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

    return { comment: formatComment(comment) };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { error: "Failed to create comment" };
  } finally {
    revalidatePath(`/thoughts/${slug}`);
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
  type: z.enum(ReactionType),
});

export async function toggleReaction(data: z.infer<typeof reactionSchema>) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) {
    return { error: "You must be signed in to react" };
  }

  // Resolve userId: look up by email for regular users,
  // or try to find/create for anonymous users.
  let userId: string | null = null;

  if (session?.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: session?.user.email },
    });
    userId = existingUser?.id ?? null;
  } else {
    // Anonymous user - try to find by id first, create if missing
    const existingUser = await prisma.user.findUnique({
      where: { id: session?.user.id },
    });
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const created = await prisma.user.create({
        data: {
          email: `anonymous-${session?.user.id}@localhost`,
          id: session?.user.id,
          isAnonymous: true,
          name: session?.user.name ?? "Guest",
        },
      });
      userId = created.id;
    }
  }

  if (!userId) {
    return { error: "User not found" };
  }

  const validated = reactionSchema.safeParse(data);

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

      return { removed: true, type };
    }

    await prisma.reaction.create({
      data: {
        commentId,
        type,
        userId,
      },
    });

    return { added: true, type };
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return { error: "Failed to toggle reaction" };
  } finally {
    // Get the comment to find its slug for proper path revalidation
    const comment = await prisma.comment.findUnique({
      select: { slug: true },
      where: { id: commentId },
    });
    if (comment) {
      revalidatePath(`/thoughts/${comment.slug}`);
    }
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
    reactions: { type: ReactionType; userId: string }[];
    createdAt: Date;
  }[];
  reactions: { type: ReactionType; userId: string }[];
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

function formatReactions(reactions: { type: ReactionType; userId: string }[]) {
  const counts: Record<ReactionType, number> = {} as Record<
    ReactionType,
    number
  >;
  const users: Record<ReactionType, string[]> = {} as Record<
    ReactionType,
    string[]
  >;

  for (const r of reactions) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
    if (!users[r.type]) users[r.type] = [];
    users[r.type].push(r.userId);
  }

  return Object.entries(counts).map(([type, count]) => ({
    count,
    type: type as ReactionType,
    users: users[type as ReactionType] ?? [],
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
  type: z.enum([
    ReactionType.HEART_BLACK,
    ReactionType.HEART_RED,
    ReactionType.FIRE,
    ReactionType.ROCKET,
    ReactionType.THUMBS_UP,
  ]),
});

export async function togglePostReaction(
  data: z.infer<typeof postReactionSchema>
) {
  const headersList = await headers();
  const currentSession = await auth.api.getSession({ headers: headersList });

  let userId: string | null = currentSession?.user.id ?? null;

  if (!userId) {
    const { user } = await auth.api.signInAnonymous();
    if (!user) {
      return { error: "Failed to sign in anonymously" };
    }
    userId = user.id;
  }

  // Resolve userId: look up by email for regular users,
  // or try to find/create for anonymous users.

  if (!userId) {
    return { error: "User not found" };
  }

  const validated = postReactionSchema.safeParse(data);

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

      return { removed: true, type };
    }

    await prisma.postReaction.create({
      data: {
        slug,
        type,
        userId,
      },
    });

    return { added: true, type };
  } catch (error) {
    console.error("Error toggling post reaction:", error);
    return { error: "Failed to toggle reaction" };
  } finally {
    revalidatePath(`/thoughts/${slug}`);
  }
}

function formatPostReactions(
  reactions: { type: ReactionType; userId: string }[]
) {
  const counts: Record<ReactionType, number> = {
    [ReactionType.FIRE]: 0,
    [ReactionType.HEART_BLACK]: 0,
    [ReactionType.HEART_RED]: 0,
    [ReactionType.ROCKET]: 0,
    [ReactionType.THUMBS_UP]: 0,
  };
  const users: Record<ReactionType, string[]> = {
    [ReactionType.FIRE]: [],
    [ReactionType.HEART_BLACK]: [],
    [ReactionType.HEART_RED]: [],
    [ReactionType.ROCKET]: [],
    [ReactionType.THUMBS_UP]: [],
  };

  for (const r of reactions) {
    const type = r.type as ReactionType;
    counts[type] = (counts[type] ?? 0) + 1;
    if (!users[type]) users[type] = [];
    users[type].push(r.userId);
  }

  return Object.entries(counts).map(([type, count]) => ({
    count,
    type,
    users: users[type as ReactionType] ?? [],
  }));
}

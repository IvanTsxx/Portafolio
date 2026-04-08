import { cacheLife, cacheTag } from "next/cache";

import { ReactionType } from "@/app/generated/prisma/enums";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/lib/cache";
import { prisma } from "@/shared/lib/prisma";

function getAuthorName(author: { name: string | null; isAnonymous: boolean }) {
  return author.isAnonymous ? "Guest" : (author.name ?? "Anonymous");
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

export async function getCommentsBySlug(slug: string) {
  "use cache";
  cacheLife(CACHE_LIFE.COMMENTS_BY_SLUG);
  cacheTag(CACHE_TAGS.COMMENTS_BY_SLUG(slug));

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

export async function getPostReactions(slug: string) {
  "use cache";
  cacheLife(CACHE_LIFE.POST_REACTIONS);
  cacheTag(CACHE_TAGS.POST_REACTIONS(slug));

  const reactions = await prisma.postReaction.findMany({
    where: { slug },
  });

  return formatPostReactions(reactions);
}

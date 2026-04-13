// oxlint-disable promise/prefer-await-to-then
"use client";

import { useForm } from "@tanstack/react-form";
import { formatDate } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { ReactionType } from "@/app/generated/prisma/enums";
import { AuthModal } from "@/shared/components/auth-modal";
import { Icons } from "@/shared/components/icons";
import { Spinner } from "@/shared/components/ui/spinner";
import { createComment, toggleReaction } from "@/shared/lib/actions/comments";
import { useSession } from "@/shared/lib/auth-client";
import { cn } from "@/shared/lib/utils";

interface Reaction {
  type: ReactionType;
  count: number;
  users: string[];
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorImage: string | null;
  authorIsAnonymous: boolean;
  createdAt: string;
  reactions: Reaction[];
  replies: Comment[];
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  [ReactionType.FIRE]: "🔥",
  [ReactionType.HEART_BLACK]: "🖤",
  [ReactionType.HEART_RED]: "❤️",
  [ReactionType.ROCKET]: "🚀",
  [ReactionType.THUMBS_UP]: "👍",
};

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment too long"),
});

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (commentId: string) => void;
  replyingTo: string | null;
  slug: string;
  router: ReturnType<typeof useRouter>;
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  replyingTo,
  slug,
  router,
}: CommentItemProps) {
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = async (type: ReactionType) => {
    await toggleReaction({ commentId: comment.id, type });
    router.refresh();
  };

  const totalReactions = comment.reactions.reduce((sum, r) => sum + r.count, 0);
  const userReactedTypes = new Set(
    comment.reactions
      .filter((r) => r.users.includes(currentUserId ?? ""))
      .map((r) => r.type)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex gap-3 py-3 border-b border-border last:border-0"
    >
      {/* Avatar */}
      <div className="shrink-0">
        {comment.authorImage ? (
          <Image
            src={comment.authorImage}
            alt={comment.authorName}
            width={24}
            height={24}
            className="w-6 h-6 object-cover"
            unoptimized
          />
        ) : (
          <div className="w-6 h-6 bg-secondary border border-border flex items-center justify-center">
            <Icons.Github className="size-6" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold">
            {comment.authorName}
          </span>
          <span className="  text-[11px] text-muted-foreground">
            {formatDate(comment.createdAt, "MMM dd, yyyy")}
          </span>
        </div>

        {replyingTo === comment.id ? (
          <ReplyForm
            commentId={comment.id}
            slug={slug}
            repliedToName={comment.authorName}
            repliedToContent={comment.content}
            onCancel={() => onReply("")}
            router={router}
          />
        ) : (
          <p className="text-[14px] text-foreground leading-relaxed wrap-break-word">
            {comment.content}
          </p>
        )}

        {/* Reactions + Reply button */}
        <div className="flex items-center gap-2 mt-1">
          {/* Reaction buttons */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReactions(!showReactions)}
              className={cn(
                "flex items-center gap-1 text-[12px] px-1.5 py-0.5 rounded transition-colors",
                totalReactions > 0
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {totalReactions > 0 && (
                <span className="flex gap-0.5">
                  {comment.reactions
                    .filter((r) => r.count > 0)
                    .map((r) => (
                      <span key={r.type} className="text-[11px]">
                        {REACTION_EMOJIS[r.type]}
                      </span>
                    ))}
                </span>
              )}
              {totalReactions > 0 && (
                <span className="text-[11px]">{totalReactions}</span>
              )}
              {totalReactions === 0 && <span>React</span>}
            </button>

            {/* Reaction picker dropdown */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 mt-1 flex gap-1 bg-background border border-border rounded-md p-1 shadow-lg z-10"
                >
                  {(
                    Object.entries(REACTION_EMOJIS) as [ReactionType, string][]
                  ).map(([type, emoji]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        handleReaction(type);
                        setShowReactions(false);
                      }}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center text-lg rounded hover:bg-secondary transition-colors",
                        userReactedTypes.has(type) && "bg-secondary"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reply button */}
          <button
            type="button"
            onClick={() => onReply(comment.id)}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-2 pl-4 border-l-2 border-border space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                replyingTo={replyingTo}
                slug={slug}
                router={router}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ReplyFormProps {
  commentId: string;
  slug: string;
  repliedToName: string;
  repliedToContent: string;
  onCancel: () => void;
  router: ReturnType<typeof useRouter>;
}

function ReplyForm({
  commentId,
  slug,
  repliedToName,
  repliedToContent,
  onCancel,
  router,
}: ReplyFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    const { error } = await createComment({
      content: text,
      parentId: commentId,
      slug,
    });
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }

    setText("");
    router.refresh();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
      {/* Original comment being replied to */}
      <div className="border border-border rounded-md p-3 bg-secondary/30">
        <div className="text-[11px] text-muted-foreground mb-1">
          Replying to{" "}
          <span className="font-medium text-foreground">{repliedToName}</span>
        </div>
        <p className="text-[13px] text-muted-foreground line-clamp-2">
          {repliedToContent}
        </p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        className={cn(
          "w-full px-3 py-2 text-sm font-sans bg-background text-foreground",
          "border border-border outline-none resize-y",
          "placeholder:text-muted-foreground",
          "focus:border-brand-green transition-colors duration-150"
        )}
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-[12px] text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="px-3 py-1 text-[12px] border border-foreground hover:bg-foreground hover:text-background transition-colors"
        >
          {isSubmitting ? "Posting..." : "Reply"}
        </button>
      </div>
    </form>
  );
}

interface CommentsSectionProps {
  slug: string;
  initialComments?: Comment[];
}

export function CommentsSection({
  slug,
  initialComments = [],
}: CommentsSectionProps) {
  const { data, isPending } = useSession();
  const router = useRouter();
  const isAnonymous = data?.user.isAnonymous;
  const user = data?.user;
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: { content: "" },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      const { error } = await createComment({
        content: value.content,
        slug,
      });
      setIsSubmitting(false);
      if (error) {
        toast.error(error);
        return;
      }
      router.refresh();
      form.reset();
    },
    validators: {
      onSubmit: commentSchema,
    },
  });

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId === replyingTo ? null : commentId);
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
        Comments
      </span>

      {/* Auth / input - auto sign in as anonymous if no session */}
      {isPending ? (
        <Spinner />
      ) : !user?.id || isAnonymous ? (
        <AuthModal
          message="Sign in to comment with your GitHub profile"
          callbackUrl={`/thoughts/${slug}`}
        />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-2"
        >
          <form.Field
            name="content"
            // oxlint-disable-next-line react/forbid-dom-props
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div>
                  <textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={() => field.handleBlur()}
                    placeholder="Leave a comment..."
                    rows={3}
                    className={cn(
                      "w-full px-3 py-2 text-sm font-sans bg-background text-foreground",
                      "border border-border outline-none resize-y",
                      "placeholder:text-muted-foreground",
                      "focus:border-brand-green transition-colors duration-150",
                      isInvalid && "border-destructive"
                    )}
                    disabled={isInvalid}
                  />
                  {isInvalid && field.state.meta.errors && (
                    <p className="  text-[12px] text-destructive mt-1">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <div className="flex items-center justify-between">
            <span className="  text-[11px] text-muted-foreground">
              Signed in as{" "}
              {data?.user.isAnonymous ? "Anonymous" : data?.user.name}
            </span>
            <button
              type="submit"
              disabled={
                (!form.state.isTouched && !form.state.isValid) || isSubmitting
              }
              className={cn(
                "px-3 py-1.5 text-[13px] font-sans border transition-colors duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "border-foreground text-foreground hover:bg-foreground hover:text-background"
              )}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      {/* Comment list */}
      {initialComments.length === 0 ? (
        <p className="  text-[12px] text-muted-foreground">
          No comments yet. Be the first.
        </p>
      ) : (
        <AnimatePresence initial={false}>
          {initialComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id ?? undefined}
              onReply={handleReply}
              replyingTo={replyingTo}
              slug={slug}
              router={router}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

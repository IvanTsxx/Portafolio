"use client";

import { motion } from "motion/react";
import Image from "next/image";

import type { Feedback } from "@/shared/config/feedbacks";

function TwitterVerifiedBadge() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      aria-label="Twitter verified"
      role="img"
    >
      <path
        fill="#1d9bf0"
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
      />
    </svg>
  );
}

interface FeedbackCardProps {
  feedback: Feedback;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <motion.a
      href={feedback.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="group flex w-[240px] shrink-0 flex-col gap-3 border border-border p-4 transition-colors hover:border-brand-green no-underline bg-background"
    >
      {/* Header: avatar + name + verified */}
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden">
          {feedback.authorAvatar ? (
            <Image
              src={feedback.authorAvatar}
              alt={feedback.authorName}
              fill
              className="object-cover"
              sizes="32px"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="  text-[9px] text-muted-foreground">
                {feedback.authorName[1]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 min-w-0">
          <span className="truncate text-[13px] font-semibold text-foreground">
            {feedback.authorName}
          </span>
          {feedback.twitterVerified && <TwitterVerifiedBadge />}
        </div>
      </div>

      {/* Quote */}
      <p className="flex-1 text-[14px] italic leading-relaxed text-muted-foreground">
        &ldquo;{feedback.quote}&rdquo;
      </p>

      {/* Footer */}

      <span className="text-[12px] text-muted-foreground">
        {feedback.authorTagline}
      </span>
    </motion.a>
  );
}

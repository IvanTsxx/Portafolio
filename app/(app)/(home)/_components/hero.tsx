"use client";

import { ExternalLink, Eye, Users, VerifiedIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Icons } from "@/shared/components/icons";
import { ShimmeringText } from "@/shared/components/shimmering-text";
import { TextFlip } from "@/shared/components/text-flip";
import { SITE } from "@/shared/config/site";
import { USER } from "@/shared/config/user";

import { TotalVisitors } from "./total-visitors";
import { VisitorCounter } from "./visit-counter";

// ─── Avatar with shimmer border on hover ──────────────────────────────────────
function Avatar() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-fit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shimmer border layer */}
      <motion.div
        className="absolute rounded-full blur-sm -inset-[2px] z-0"
        initial={{ background: "rgba(0,0,0,0)" }}
        animate={
          isHovered
            ? {
                background: [
                  "linear-gradient(0deg, #22c55e, #ffffff, #22c55e)",
                  "linear-gradient(180deg, #22c55e, #ffffff, #22c55e)",
                  "linear-gradient(360deg, #22c55e, #ffffff, #22c55e)",
                ],
              }
            : { background: "rgba(0,0,0,0)" }
        }
        transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
      />
      <div className="relative z-10  h-16 w-16 lg:h-24 lg:w-24 p-[2px]">
        <Image
          src="/images/avatar.jpeg"
          alt="Iván Bongiovanni"
          width={100}
          height={100}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="block object-cover rounded-full"
          priority
        />
      </div>
    </div>
  );
}

export function Hero({
  totalVisits,
  visitorNumber,
}: {
  totalVisits: number;
  visitorNumber: number;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-8">
      {/* Top section */}
      <div className="flex  gap-6 border-b border-line pb-6 md:flex-row md:gap-8">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="shrink-0"
        >
          <Avatar />
        </motion.div>

        {/* Info */}
        <div className="flex flex-col justify-center gap-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col"
          >
            <div className="grow items-end pb-1 hidden lg:flex">
              <p
                className="line-clamp-1 font-light text-xs text-zinc-300 select-none dark:text-zinc-700"
                aria-hidden="true"
              >
                {USER.heroClass}
              </p>
            </div>

            <ShimmeringText
              text={USER.bio}
              className="text-xs lg:text-sm font-medium max-w-full"
            />
          </motion.div>

          <section className="flex items-start gap-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-2xl font-bold tracking-tight md:text-3xl"
            >
              {USER.displayName}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <VerifiedIcon className="size-4.5 text-brand-green bg-accent" />
            </motion.div>
          </section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="min-h-16 max-w-full lg:max-w-none"
          >
            <TextFlip
              as={motion.span}
              className="min-w-32 text-foreground"
              interval={2.5}
            >
              {USER.flipSentences.map((text) => (
                <span key={text}>{text}</span>
              ))}
            </TextFlip>
          </motion.div>
          <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <TotalVisitors totalVisits={totalVisits} />
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="size-4" />
              <VisitorCounter visitorNumber={visitorNumber} />
            </div>
          </section>
        </div>
      </div>

      {/* Social */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-1 gap-px border-t border-boder sm:grid-cols-3"
      >
        {[
          {
            href: SITE.twitter,
            icon: Icons.Twitter,
            label: "Twitter",
          },
          {
            href: SITE.github,
            icon: Icons.Github,
            label: "GitHub",
          },
          {
            href: SITE.linkedin,
            icon: Icons.Linkedin,
            label: "LinkedIn",
          },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            prefetch={false}
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 bg-background p-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Icon className="size-5" />
              <span className="font-medium">{label}</span>
            </div>
            <ExternalLink className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </motion.div>
    </section>
  );
}

"use client";

import { VerifiedIcon } from "lucide-react";
import { motion } from "motion/react";

import { TextFlip } from "@/shared/components/text-flip";
import { USER } from "@/shared/config/user";

import { Avatar } from "./avatar";
import { HeroTitle } from "./hero-title";

export const HeroInfoMiddle = () => (
  <section className="flex flex-col gap-y-3">
    <HeroTitle />
    <div className="flex items-center gap-3">
      <Avatar />
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-2">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-xl font-bold tracking-tight md:text-2xl"
          >
            {USER.displayName}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <VerifiedIcon className="size-4.5 text-brand-green" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="min-h-6"
        >
          <TextFlip
            as={motion.span}
            className="text-muted-foreground text-sm"
            interval={2.5}
          >
            {USER.flipSentences.map((text) => (
              <span key={text}>{text}</span>
            ))}
          </TextFlip>
        </motion.div>
      </div>
    </div>
  </section>
);

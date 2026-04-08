"use client";

import { motion } from "motion/react";

import { TextFlip } from "@/shared/components/text-flip";
import { USER } from "@/shared/config/user";

export const HeroInfoFlip = () => (
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
);

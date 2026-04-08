"use client";

import { VerifiedIcon } from "lucide-react";
import { motion } from "motion/react";

import { USER } from "@/shared/config/user";

export const HeroInfoMiddle = () => (
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
);

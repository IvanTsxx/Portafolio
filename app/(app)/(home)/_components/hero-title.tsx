"use client";

import { motion } from "motion/react";

export const HeroTitle = () => (
  <motion.h1
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.6 }}
    className="text-4xl w-full font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
  >
    Next.js Developer
  </motion.h1>
);

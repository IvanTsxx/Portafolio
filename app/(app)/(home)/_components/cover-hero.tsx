// oxlint-disable no-param-reassign
"use client";

import { motion } from "motion/react";

import { DinoGame } from "./dino-game";

export function CoverHero() {
  return (
    <section className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden">
      {/* Dino Game */}
      <DinoGame />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-5xl text-center font-bold tracking-tight text-foreground sm:text-6xl md:text-[64px]"
      >
        Next.js Developer
      </motion.h1>
    </section>
  );
}

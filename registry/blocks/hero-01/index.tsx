"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export default function Hero01() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800" />

      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-200/80 px-4 py-1.5 text-sm font-medium text-zinc-700 backdrop-blur-sm dark:bg-zinc-800/80 dark:text-zinc-300">
              <Sparkles className="h-4 w-4" />
              New: Version 2.0 is here
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Build beautiful products
            <br />
            <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">
              faster than ever
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 md:text-xl"
          >
            A collection of production-ready components, blocks, and pages
            built with Tailwind CSS. Copy and paste into your project.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="rounded-full">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
              View Components
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">10k+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">500+</span>
              <span>Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">99%</span>
              <span>Satisfaction</span>
            </div>
          </motion.div>
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">10k+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">500+</span>
              <span>Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">99%</span>
              <span>Satisfaction</span>
            </div>
          </motion.div>
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">10k+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">500+</span>
              <span>Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">99%</span>
              <span>Satisfaction</span>
            </div>
          </motion.div>
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">10k+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">500+</span>
              <span>Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">99%</span>
              <span>Satisfaction</span>
            </div>
          </motion.div>
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">10k+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">500+</span>
              <span>Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">99%</span>
              <span>Satisfaction</span>
            </div>
          </motion.div>
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">10k+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">500+</span>
              <span>Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">99%</span>
              <span>Satisfaction</span>
            </div>
          </motion.div>
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">10k+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">500+</span>
              <span>Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">99%</span>
              <span>Satisfaction</span>
            </div>
          </motion.div>
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">10k+</span>
              <span>Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">500+</span>
              <span>Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">99%</span>
              <span>Satisfaction</span>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
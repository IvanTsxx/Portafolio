"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export default function Hero02() {
  return (
    <section className="relative flex min-h-[500px] w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 py-24">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Gradient orbs */}
      <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="container relative mx-auto px-4 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          The future of
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            web development
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="mx-auto mb-8 max-w-xl text-lg text-zinc-400"
        >
          Production-ready components crafted with care. Focus on building
          your product, not the UI.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" className="rounded-full bg-white text-zinc-900 hover:bg-zinc-100">
            Start Building
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="ghost" className="rounded-full text-white hover:bg-white/10">
            Browse Library
          </Button>
        </motion.div>

        {/* Code snippet */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm"
        >
          <code className="text-sm text-zinc-400">
            <span className="text-blue-400">npx</span>{" "}
            <span className="text-green-400">shadcn@latest</span>{" "}
            <span className="text-white">add</span>{" "}
            <span className="text-yellow-400">@ivantsx/hero-01</span>
          </code>
        </motion.div>
      </div>
    </section>
  );
}
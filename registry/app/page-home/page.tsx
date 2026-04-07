"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export default function PageHome() {
  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold">Brand</span>
          <div className="flex items-center gap-6">
            <a href="#products" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              Products
            </a>
            <a href="#pricing" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              Pricing
            </a>
            <a href="#about" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              About
            </a>
            <Button size="sm">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-200/50 px-4 py-1.5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Sparkles className="h-4 w-4" />
            Built with shadcn/ui
          </span>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl">
            The modern way to build.
          </h1>

          <p className="mb-8 max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
            Beautiful, accessible components built with Tailwind CSS and Radix UI.
            Copy and paste into your project.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="rounded-full">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
              View Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="products" className="w-full bg-white py-24 dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Why Choose Us
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">
              Everything you need to build great products
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 inline-flex rounded-lg bg-zinc-200 p-3 dark:bg-zinc-800">
                <Zap className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
                Lightning Fast
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Optimized for performance from the ground up. Zero JavaScript overhead.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 inline-flex rounded-lg bg-zinc-200 p-3 dark:bg-zinc-800">
                <Shield className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
                Accessible
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                WCAG 2.1 compliant. Full keyboard navigation and screen reader support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 inline-flex rounded-lg bg-zinc-200 p-3 dark:bg-zinc-800">
                <Sparkles className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
                Beautiful
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Carefully crafted design system with dark mode support out of the box.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="w-full py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 p-8 text-center dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
              Ready to get started?
            </h2>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              Join thousands of developers building better products.
            </p>
            <Button size="lg" className="rounded-full">
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="w-full border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          © 2026 Brand. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
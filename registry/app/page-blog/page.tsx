"use client";

import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

export default function PageBlog() {
  const posts = [
    {
      title: "Getting Started with shadcn/ui",
      excerpt: "Learn how to build beautiful interfaces with copy-paste components.",
      date: "March 15, 2026",
      readTime: "5 min read",
      author: "Juan B.",
    },
    {
      title: "Advanced Animation Patterns",
      excerpt: "Deep dive into Framer Motion for production-ready animations.",
      date: "March 10, 2026",
      readTime: "8 min read",
      author: "Juan B.",
    },
    {
      title: "Building Accessible UIs",
      excerpt: "WCAG 2.1 compliance made simple with Radix primitives.",
      date: "March 5, 2026",
      readTime: "6 min read",
      author: "Juan B.",
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </a>
          <span className="text-xl font-bold">Blog</span>
          <div className="w-16" />
        </div>
      </header>

      {/* Hero */}
      <section className="w-full py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Latest Articles
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Thoughts on frontend development, design systems, and building better products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="w-full bg-zinc-50 py-16 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {posts.map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h2 className="mb-2 text-xl font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-300">
                  {post.title}
                </h2>
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
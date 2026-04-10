export interface Project {
  id: string;
  title: string;
  period: { start: string; end?: string };
  description: string;
  skills: string[];
  github?: string;
  link?: string;
}

export const PROJECTS: Project[] = [
  {
    description: `
    MercadoPago plugin for Better Auth
    - Authentication-first payments tied to users.
    - Subscription management (recurring payments).
    - Built-in webhook handling & verification.
    - Type-safe with TypeScript + Zod.
    - Plug & play Better Auth plugin with minimal setup.
    - Designed for LATAM (MercadoPago ecosystem).
      `,
    github: "https://github.com/IvanTsxx/better-auth-mp",
    id: "better-auth-mp",
    link: "https://better-auth-mp-docs.bongi.dev/",
    period: { start: "2026" },
    skills: [
      "TypeScript",
      "Zod",
      "Better Auth",
      "MercadoPago API",
      "Next.js",
      "Prisma",
    ],
    title: "MercadoPago Plugin for Better Auth",
  },

  {
    description: `
    Personal portfolio and component registry
    - Built with Next.js 16, TypeScript, Tailwind CSS v4, and motion/react.
    - Features a GitHub contributions graph and opensource contributions.
    - Shadcn CLI for component installation.
    - Components preview and usage examples.
    - Mdx for blog posts and diferents sections in all the site.
      `,
    github: "https://github.com/IvanTsxx/portafolio",
    id: "ivantsx",
    link: "https://ibong.bongi.dev",
    period: { start: "2025" },
    skills: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "motion/react",
      "shadcn/ui",
      "Mdx",
    ],
    title: "Portfolio",
  },

  {
    description: `
  Custom AI skills for Next.js development
  - Architect Next.js skill enforcing scalable architecture patterns.
  - Applies Scope Rule (local vs shared components).
  - Uses Screaming Architecture for clear structure.
  - Optimized for Next.js 15+ (App Router, RSC, Server Actions).
  - Distributed via skills.sh for AI coding agents.
    `,
    github: "https://github.com/IvanTsxx/my-next-skills",
    id: "my-next-skills",
    link: "https://skills.sh/ivantsxx/my-next-skills/architect-nextjs",
    period: { start: "2026" },
    skills: ["Next.js", "TypeScript", "Architecture", "AI Agents", "skills.sh"],
    title: "My Next.js Skills",
  },

  {
    description: `
    AI-first Next.js monorepo starter
    - Production-ready monorepo with Turborepo + Bun.
    - Built-in PostgreSQL + Prisma + Better Auth.
    - Native support for AI agents (MCP servers & Skills).
    - Pre-configured global AI rules (Claude, OpenAI, Cursor, etc).
    - Strong DX with Ultracite (Oxlint + Oxfmt) and Husky.
    - Fully typed env system with Zod (t3-env).
      `,
    github: "https://github.com/IvanTsxx/AI-Nextjs-Monorepo-Starter",
    id: "ai-nextjs-monorepo-starter",
    link: "https://github.com/IvanTsxx/AI-Nextjs-Monorepo-Starter",
    period: { start: "2026" },
    skills: [
      "Next.js",
      "TypeScript",
      "Turborepo",
      "Bun",
      "Prisma",
      "PostgreSQL",
      "Better Auth",
      "Zod",
      "Docker",
    ],
    title: "AI Next.js Monorepo Starter",
  },

  {
    description: `
  Granular caching demo with Next.js 16
  - Field-level caching using Cache Components.
  - Independent strategies per field (text, price, stock).
  - Tag-based revalidation (revalidateTag).
  - Static shell + streaming with Suspense (PPR patterns).
  - Real-time demo to test caching behavior.
  - Fully type-safe with TypeScript + Zod.
    `,
    github: "https://github.com/IvanTsxx/cache-components-granular",
    id: "cache-components-granular",
    link: "https://cache-components-granular.bongi.dev/es",
    period: { start: "2026" },
    skills: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Zod",
      "shadcn/ui",
    ],
    title: "Cache Components Granular Demo",
  },

  {
    description: `
  AI-powered CV improvement tool
  - Generates 10 personalized CV recommendations from a job description.
  - Uses Google Gemini AI via Vercel AI SDK.
  - Upload CV (PDF) + job offer → optimized feedback.
  - Simple and free tool focused on real hiring alignment.
  - Clean UI built with shadcn/ui.
    `,
    github: "https://github.com/IvanTsxx/AI-CV-Recomendations",
    id: "ai-cv-recommendations",
    link: "https://ai-cv-recomendations.bongi.dev/",
    period: { start: "2025" },
    skills: [
      "Next.js",
      "TypeScript",
      "Vercel AI SDK",
      "Google Gemini",
      "shadcn/ui",
    ],
    title: "AI CV Recommendations",
  },

  {
    description: `
  Open-source platform for dev memes
  - Share, discover and explore programming memes.
  - Built with Next.js 16 (App Router + Server Actions).
  - Feature-first (Screaming Architecture) structure.
  - PostgreSQL serverless with Neon + Drizzle ORM.
  - Auth with Better Auth and validation with Zod.
  - Modern UI with shadcn/ui and Radix.
    `,
    github: "https://github.com/IvanTsxx/MemesDev",
    id: "memesdev",
    link: "https://memes-dev.bongi.dev/",
    period: { start: "2025" },
    skills: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Drizzle ORM",
      "PostgreSQL",
      "Better Auth",
      "Zod",
    ],
    title: "MemesDev",
  },

  {
    description: `
  Hackathon platform for developers
  - Create, join and explore hackathons and teams.
  - Built with Next.js 16 + React 19 (App Router, RSC).
  - Fullstack setup with Prisma + PostgreSQL.
  - Authentication and sessions with Better Auth.
  - Modern UI with Tailwind CSS v4 and shadcn/ui.
  - Focused on community, collaboration and events.
    `,
    github: "https://github.com/IvanTsxx/Hackra",
    id: "hackra",
    link: "https://github.com/IvanTsxx/Hackra",
    period: { start: "2026" },
    skills: [
      "Next.js",
      "React",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "Better Auth",
      "Tailwind CSS",
      "shadcn/ui",
    ],
    title: "Hackra",
  },
  {
    description: `
  Reusable media upload microservice
  - Upload images from any project via pre-signed URLs.
  - Built with Fastify + TypeScript.
  - S3-compatible storage (Tigris/AWS).
  - Prisma + PostgreSQL for file metadata.
  - Endpoints for upload, confirm and delete.
  - Swagger docs and validation with Zod.
    `,
    github: "https://github.com/IvanTsxx/Media-Service",
    id: "media-service",
    link: "https://github.com/IvanTsxx/Media-Service",
    period: { start: "2025" },
    skills: [
      "Node.js",
      "Fastify",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "AWS S3",
      "Zod",
      "Docker",
    ],
    title: "Media Service",
  },
];

# Portafolio

> Personal portfolio and blog built with modern web technologies

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-38BDF8?style=flat&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

Personal portfolio and blog with authentication, MDX content, and a component registry.

## Stack

| Technology              | Purpose               |
| ----------------------- | --------------------- |
| **Next.js 16**          | App Router + React 19 |
| **Tailwind CSS v4**     | Styling               |
| **shadcn/ui**           | Components            |
| **better-auth**         | GitHub OAuth          |
| **Prisma**              | PostgreSQL ORM        |
| **TanStack Form + Zod** | Form handling         |

## Features

- **Blog** — MDX posts with syntax highlighting (Shiki)
- **Component Registry** — Publish shadcn/ui components
- **Authentication** — GitHub OAuth via better-auth
- **Analytics** — Vercel Analytics
- **Database** — PostgreSQL with Prisma + Redis caching

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

## Commands

| Command             | Description               |
| ------------------- | ------------------------- |
| `bun run dev`       | Dev server with Turbopack |
| `bun run build`     | Production build          |
| `bun run typecheck` | Type check                |
| `bun run fix`       | Auto-fix lint & format    |
| `bun run db:studio` | Prisma Studio             |

## Contributing

Contributions are welcome! If you find a bug or have a feature idea:

1. Fork the repo
2. Create your branch (`git checkout -b feature/awesome`)
3. Commit your changes
4. Push to the branch
5. Open a PR

If this project helps you, consider giving it a ⭐ — it keeps me motivated to keep building.

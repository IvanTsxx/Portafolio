// content/lab.ts — personal projects, explorations, experiments
export interface LabStudy {
  slug: string
  index: string
  title: string
  year: string
  note: string
  tags: string[]
  /** Optional photo — hover reveals. Omit / null for ASCII-only. */
  imageSrc?: string | null
  /** Optional precomputed ASCII under /public */
  asciiSrc?: string | null
  /** Source code */
  repoHref?: string
  /** Live deploy / docs site, when it has one */
  demoHref?: string
}

export const LAB: LabStudy[] = [
  {
    slug: 'generative-fields',
    index: '001',
    title: 'Generative Field System',
    year: '2026',
    note: 'Shared rAF provider, density buffers, and character ramps — engine for this site.',
    tags: ['Next.js', 'ASCII', 'Math'],
    repoHref: 'https://github.com/IvanTsxx/Portafolio/tree/main/lib/ascii',
  },
  {
    slug: 'portal-cosmos',
    index: '002',
    title: 'Portal cosmos',
    year: '2026',
    note: 'Wormhole navigation: 900ms contract, ASCII world, half-wheel destinations.',
    tags: ['Three', 'R3F', 'Motion'],
    repoHref: 'https://github.com/IvanTsxx/Portafolio/tree/main/lib/portal',
  },
  {
    slug: 'better-auth-mp',
    index: '003',
    title: 'Better Auth MercadoPago Plugin',
    year: '2026',
    note: 'MercadoPago plugin for Better Auth — subscriptions, webhooks, LATAM payments.',
    tags: ['Better Auth', 'MercadoPago API', 'TypeScript'],
    repoHref: 'https://github.com/IvanTsxx/better-auth-mp',
    demoHref: 'https://better-auth-mp.bongi.dev/es',
  },
  {
    slug: 'skills-packs',
    index: '004',
    title: 'Skills Packs',
    year: '2026',
    note: 'Collection of AI agent skill packs, installable via Vercel Skills CLI.',
    tags: ['AI Agents', 'Next.js', 'Vercel Skills'],
    repoHref: 'https://github.com/IvanTsxx/skills-packs',
  },
  {
    slug: 'my-next-skills',
    index: '005',
    title: 'My Next.js Skills',
    year: '2026',
    note: 'Next.js architecture skill — Scope Rule + Screaming Architecture, distributed via skills.sh.',
    tags: ['Next.js', 'Architecture', 'AI Agents'],
    repoHref: 'https://github.com/IvanTsxx/my-next-skills',
    demoHref: 'https://skills.sh/ivantsxx/my-next-skills/architect-nextjs',
  },
  {
    slug: 'ai-nextjs-monorepo-starter',
    index: '006',
    title: 'AI Next.js Monorepo Starter',
    year: '2026',
    note: 'AI-first Next.js monorepo starter — Turborepo, Bun, Prisma, native MCP/Skills support.',
    tags: ['Next.js', 'Turborepo', 'Bun'],
    repoHref: 'https://github.com/IvanTsxx/AI-Nextjs-Monorepo-Starter',
  },
  {
    slug: 'cache-components-granular',
    index: '007',
    title: 'Cache Components Granular Demo',
    year: '2026',
    note: 'Granular caching demo — field-level Cache Components, tag-based revalidation, PPR patterns.',
    tags: ['Next.js', 'Cache Components', 'TypeScript'],
    repoHref: 'https://github.com/IvanTsxx/cache-components-granular',
    demoHref: 'https://cache-components.bongi.dev/es',
  },
]

export function getLab(slug: string): LabStudy | undefined {
  return LAB.find((l) => l.slug === slug)
}

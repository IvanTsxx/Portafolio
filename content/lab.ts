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
  href?: string
}

export const LAB: LabStudy[] = [
  {
    slug: 'generative-fields',
    index: '001',
    title: 'Generative Field System',
    year: '2026',
    note: 'Shared rAF provider, density buffers, and character ramps — engine for this site.',
    tags: ['Next.js', 'ASCII', 'Math'],
    imageSrc: '/images/avatar.webp',
  },
  {
    slug: 'portal-cosmos',
    index: '002',
    title: 'Portal cosmos',
    year: '2026',
    note: 'Wormhole navigation: 900ms contract, ASCII world, half-wheel destinations.',
    tags: ['Three', 'R3F', 'Motion'],
    imageSrc: '/logos/basement.webp',
  },
  {
    slug: 'agent-dashboard',
    index: '003',
    title: 'Agent Orchestration',
    year: '2025',
    note: 'Operator surface for multi-agent runs — timelines, tool traces, interruption-safe UI.',
    tags: ['eve', 'AI SDK', 'TypeScript'],
    // ASCII-only for now — drop imageSrc when a shot exists
    imageSrc: null,
  },
  {
    slug: 'edge-toolkit',
    index: '004',
    title: 'Edge UI Toolkit',
    year: '2025',
    note: 'Primitives for interactive UI at the edge without losing typography control.',
    tags: ['Next.js', 'Vercel', 'Performance'],
    imageSrc: null,
  },
]

export function getLab(slug: string): LabStudy | undefined {
  return LAB.find((l) => l.slug === slug)
}

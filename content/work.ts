// content/work.ts
export interface WorkProject {
  slug: string
  index: string
  title: string
  year: string
  tags: string[]
  summary: string
  role: string
}

export const WORK: WorkProject[] = [
  {
    slug: 'generative-fields',
    index: '001',
    title: 'Generative Field System',
    year: '2026',
    tags: ['Next.js', 'ASCII', 'Math'],
    summary:
      'Shared rAF provider, density buffers, and character ramps that power the portfolio lab and home phyllotaxis field.',
    role: 'Design + engineering',
  },
  {
    slug: 'agent-dashboard',
    index: '002',
    title: 'Agent Orchestration Dashboard',
    year: '2025',
    tags: ['eve', 'AI SDK', 'TypeScript'],
    summary:
      'Operator surface for multi-agent runs — timelines, tool traces, and interruption-safe UI state.',
    role: 'Frontend lead',
  },
  {
    slug: 'edge-toolkit',
    index: '003',
    title: 'Edge-computed UI Toolkit',
    year: '2025',
    tags: ['Next.js', 'Vercel', 'Performance'],
    summary:
      'Primitives and patterns for shipping interactive UI at the edge without sacrificing typography control.',
    role: 'Library author',
  },
]

export function getWork(slug: string): WorkProject | undefined {
  return WORK.find((w) => w.slug === slug)
}

// content for portal home — destinations + short stubs (routes wired next)
export type PortalTheme = 'dark' | 'light'
export type DestId = 'home' | 'work' | 'craft' | 'studio' | 'open'

export const IVAN = {
  name: 'Ivan Bongiovanni',
  short: 'Ivan',
  role: 'Frontend Developer',
  studio: 'basement studio',
  location: 'Tucumán, AR',
  tagline: 'Next.js products, serious craft.',
  blurb:
    'Frontend en basement studio. Construyo productos en Next.js, TypeScript y shadcn — con Motion cuando el detalle importa. Aprendo rápido; demuestro valor en shipping.',
  pitch:
    'Si buscás alguien que ya labura en un studio de primer nivel y quiere seguir subiendo el listón en App Router, design systems y motion — hablamos.',
  stack: ['Next.js', 'TypeScript', 'shadcn/ui', 'Motion', 'React', 'Tailwind'],
  learning: ['Agent skills', 'Claude', 'MCPs', 'WebGL'],
  courses: ['Invisible Details', 'animations.dev'],
  cv: [
    {
      place: 'basement studio',
      role: 'Frontend Developer',
      when: 'Present',
      note: 'Product UI, design systems adjacent work, motion, delivery con equipos de alto nivel.',
    },
    {
      place: 'Earlier roles',
      role: 'Frontend',
      when: 'Before',
      note: 'Placeholder — Ivan completa estudios / labs previos.',
    },
  ],
  agentPrompt: `Ivan Bongiovanni — Frontend Developer at basement studio (Tucumán, AR).
Serious Next.js / TypeScript / shadcn / Motion. Ships product UI; strong CV via basement.
Also building agent-aware surfaces (skills, Claude, MCPs).
Prefers: structured briefs, clear constraints, RSC-first.
Status: open to product teams and focused collabs.`,
} as const

export const DESTINATIONS: {
  id: DestId
  label: string
  sub: string
  mood: number
  body: string
  /** Real route — wheel will portal-navigate here next */
  href: string | null
}[] = [
  {
    id: 'home',
    label: 'Home',
    sub: 'Surface',
    mood: 0,
    body: 'Back to the surface.',
    href: '/',
  },
  {
    id: 'work',
    label: 'Work',
    sub: 'Selected shipping',
    mood: 0.2,
    body: 'Sistemas generativos, surfaces de producto, transiciones con contrato claro. Lo que ya está en el mundo — no demos sueltas.',
    href: '/work',
  },
  {
    id: 'craft',
    label: 'Craft',
    sub: 'Next · shadcn · Motion',
    mood: 0.45,
    body: 'App Router en serio, componentes con shadcn, Motion con bounce 0 y timing que se siente. Invisible Details y animations.dev no fueron turismo — fueron oficio.',
    href: '/lab',
  },
  {
    id: 'studio',
    label: 'Studio',
    sub: 'basement + origin',
    mood: 0.7,
    body: 'Trabajo en basement studio. Eso ya dice mucho del listón. Soy de Tucumán; traigo predisposición a aprender y a demostrar valor en el siguiente nivel.',
    href: '/about',
  },
  {
    id: 'open',
    label: 'Open',
    sub: 'Let’s talk',
    mood: 0.9,
    body: 'Product teams y collabs focalizados. Brief claro, constraints honestos. El CV ya tiene basement — lo que falta es el problema correcto.',
    href: null,
  },
]

export const WORK_STUBS = [
  {
    title: 'Generative Field System',
    year: '2026',
    note: 'Motor compartido de density/rAF — base para lab y home.',
    href: '/work/generative-fields',
  },
  {
    title: 'Product UI at basement',
    year: '2025',
    note: 'Interfaces de producto con equipos de craft alto — delivery, no slides.',
    href: '/work',
  },
  {
    title: 'Portal transitions',
    year: '2025',
    note: 'Navegación como evento: 900ms, un ease, scramble — Motion con reglas.',
    href: '/notes/portal-900',
  },
] as const

export const NOTE_STUBS = [
  {
    title: 'ASCII vs SVG',
    year: '2026',
    note: 'Cuándo el motor tipográfico gana, y cuándo no.',
    href: '/notes/ascii-vs-svg',
  },
  {
    title: 'Portal 900',
    year: '2026',
    note: 'Una duración, un ease — navegación como evento.',
    href: '/notes/portal-900',
  },
  {
    title: 'Invisible details in shipping UI',
    year: '2025',
    note: 'Lo que aprendí aplicando Emil en producto real.',
    href: '/notes',
  },
] as const

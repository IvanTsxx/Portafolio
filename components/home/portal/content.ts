// content for portal home — destinations + short stubs (routes wired next)
export type PortalTheme = 'dark' | 'light'
/** Wheel spokes = Home + site pages. `open` is chamber-only — not on the arc. */
export type DestId = 'home' | 'work' | 'notes' | 'lab' | 'about' | 'open'
export type ChamberSide = 'left' | 'right'

/**
 * Alternate chamber float: home left → work right → notes left → …
 * Mirrors the spoke order so consecutive pages flip sides.
 */
export function chamberSide(id: DestId): ChamberSide {
  switch (id) {
    case 'home':
    case 'notes':
    case 'about':
      return 'left'
    case 'work':
    case 'lab':
    case 'open':
      return 'right'
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}

export const IVAN = {
  name: 'Ivan Bongiovanni',
  displayName: 'Iván Bongiovanni',
  short: 'Ivan',
  handle: 'ivantsx',
  role: 'Frontend Developer',
  studio: 'basement studio',
  location: 'Tucumán, AR',
  email: 'bongiovannidev@gmail.com',
  website: 'https://bongi.dev',
  avatar: '/images/avatar.webp',
  socials: {
    github: 'https://github.com/IvanTsxx',
    twitter: 'https://x.com/IvanTsxx',
    linkedin: 'https://www.linkedin.com/in/bongiovanni-ivan45',
  },
  tagline: 'Next.js products, serious craft.',
  blurb:
    'Frontend at basement studio. I ship Next.js, TypeScript, and shadcn products — Motion when the detail matters. Learn fast; prove value in shipping.',
  pitch:
    'If you want someone already shipping at a top-tier studio — and still raising the bar on App Router, design systems, and motion — let’s talk.',
  stack: ['Next.js', 'TypeScript', 'shadcn/ui', 'Motion', 'React', 'Tailwind'],
  learning: ['Agent skills', 'Claude', 'MCPs', 'WebGL'],
  courses: ['Invisible Details', 'animations.dev'],
  cv: [
    {
      place: 'basement studio',
      role: 'Frontend Developer',
      when: '04.2026 — Present',
      note: 'Product UI, design-systems-adjacent work, motion, delivery with high-craft teams.',
    },
    {
      place: 'Aliva Shop',
      role: 'Frontend Developer',
      when: '06.2025 — 04.2026',
      note: 'Q-commerce modernization: Angular → standalone + Signals; Ionic + Capacitor for mobile.',
    },
    {
      place: 'Tensolite SA',
      role: 'Full Stack Developer',
      when: '07.2023 — 11.2023',
      note: 'Internal tools: Excel import/export, PDF generation, ops workflow automation.',
    },
    {
      place: 'Doctor Qali',
      role: 'Frontend Developer',
      when: '01.2023 — 06.2023',
      note: 'HealthTech: render bottlenecks, bundle size, Lighthouse, modern React patterns.',
    },
  ],
  agentPrompt: `Ivan Bongiovanni — Frontend Developer at basement studio (Tucumán, AR).
Serious Next.js / TypeScript / shadcn / Motion. Ships product UI; strong CV via basement.
Also building agent-aware surfaces (skills, Claude, MCPs).
Contact: bongiovannidev@gmail.com · https://bongi.dev · github.com/IvanTsxx
Prefers: structured briefs, clear constraints, RSC-first.
Status: open to product teams and focused collabs.`,
} as const

export const DESTINATIONS: {
  id: DestId
  label: string
  sub: string
  mood: number
  body: string
  /** Real route — wheel portals here on hold */
  href: string
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
    sub: 'Experience',
    mood: 0.2,
    body: 'Roles, teams, and delivery — basement, product, performance. The professional track, not loose demos.',
    href: '/work',
  },
  {
    id: 'notes',
    label: 'Notes',
    sub: 'Writing · process',
    mood: 0.4,
    body: 'Notes on craft, ASCII vs SVG, portals, and invisible details. Thinking in public with the same rigor as shipping.',
    href: '/notes',
  },
  {
    id: 'lab',
    label: 'Lab',
    sub: 'Projects · explorations',
    mood: 0.6,
    body: 'Personal projects, ASCII engines, portals, and explorations. Built for craft and curiosity.',
    href: '/lab',
  },
  {
    id: 'about',
    label: 'About',
    sub: 'basement + origin',
    mood: 0.8,
    body: 'I work at basement studio — that already sets the bar. From Tucumán; quick to learn, prove value at the next level.',
    href: '/about',
  },
]

/** Contact chamber on home — not a wheel spoke. */
export const OPEN_DEST = {
  id: 'open' as const,
  label: 'Open',
  sub: 'Let’s talk',
  mood: 0.9,
  body: 'Product teams and focused collabs. Clear brief, honest constraints. The CV already has basement — what’s missing is the right problem.',
}

export const WORK_STUBS = [
  {
    title: 'basement studio',
    year: '2026 — Present',
    note: 'Frontend · product UI, motion, delivery with high-craft teams.',
    href: '/work/basement-studio',
  },
  {
    title: 'Aliva Shop',
    year: '2025 — 2026',
    note: 'Frontend · Q-commerce modernization Angular → Signals + Ionic.',
    href: '/work/aliva-shop',
  },
  {
    title: 'Tensolite SA',
    year: '2023',
    note: 'Full stack · internal tools, Excel/PDF, ops automation.',
    href: '/work/tensolite',
  },
] as const

export const NOTE_STUBS = [
  {
    title: 'ASCII vs SVG',
    year: '2026',
    note: 'When the typographic engine wins — and when it doesn’t.',
    href: '/notes/ascii-vs-svg',
  },
  {
    title: 'Portal 900',
    year: '2026',
    note: 'One duration, one ease — navigation as an event.',
    href: '/notes/portal-900',
  },
  {
    title: 'Invisible details in shipping UI',
    year: '2025',
    note: 'What I learned applying Emil on real product.',
    href: '/notes',
  },
] as const

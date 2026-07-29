// content/identity.ts
// Canonical personal facts — sourced from the previous portfolio (IvanTsxx/Portafolio).
// Marked as possibly outdated by the owner, but real. Update when facts change.

export const IDENTITY = {
  /** Short brand / moniker used on generative surfaces */
  brand: 'IB',
  name: 'Ivan Bongiovanni',
  displayName: 'Iván Bongiovanni',
  short: 'Ivan',
  handle: 'ivantsx',
  role: 'Frontend Developer',
  studio: 'basement studio',
  year: '2026',
  location: {
    city: 'San Miguel de Tucumán',
    region: 'Tucumán',
    country: 'Argentina',
    short: 'Tucumán, AR',
  },
  timeZone: 'America/Argentina/Tucuman',
  email: 'bongiovannidev@gmail.com',
  website: 'https://bongi.dev',
  avatar: '/profile.png',
  avatarRemote: 'https://github.com/IvanTsxx.png',
  socials: {
    github: 'https://github.com/IvanTsxx',
    twitter: 'https://x.com/IvanTsxx',
    linkedin: 'https://www.linkedin.com/in/bongiovanni-ivan45',
  },
  tagline: 'Building at the edge of generative systems.',
  summary:
    'Frontend developer at basement studio, from Tucumán. Next.js surfaces, agent tooling, and generative ASCII — work that reads clean to people and to agents.',
  bio: 'Specializing in Next.js. Building fast, typesafe, and beautiful web experiences.',
  openTo: 'Focused contracts',
  available: true,
  stack: ['Next.js', 'TypeScript', 'AI SDK', 'eve', 'Motion', 'Three'],
  focus: ['Generative UI', 'Agent surfaces', 'Edge delivery'],
  /** Words that appear in the live spiral — identity, place, stack. Not filler. */
  lexicon: [
    'TUCUMAN',
    'SAN MIGUEL',
    'CERRO',
    'YERBA',
    'IVAN',
    'IVANTSX',
    'FRONTEND',
    'NEXT',
    'TYPESCRIPT',
    'ASCII',
    'PORTAL',
    'AGENT',
    'EVE',
    'GENERATIVE',
    'EDGE',
    'MOTION',
    'R3F',
  ],
  /** Machine-oriented card — also shown in the UI for transparency. */
  agent: {
    NAME: 'Ivan Bongiovanni',
    ROLE: 'Frontend Developer · basement studio',
    LOC: 'Tucumán, AR',
    STACK: 'Next 16 · TS strict · AI SDK · eve',
    ASCII: 'live',
    PORTAL: '900ms',
    STATUS: 'open',
    PREFERS: 'structured briefs · clear constraints · RSC-first',
  },
  /**
   * Work history from the previous portfolio.
   * Dates may need a refresh — treat as real but not necessarily current.
   */
  experiences: [
    {
      id: 'studio-basement',
      company: 'basement studio',
      website: 'https://basement.studio',
      logo: '/logos/basement.webp',
      current: true,
      role: 'Frontend Developer',
      when: '04.2026 — Present',
      type: 'Full-time',
      note: 'Product UI, design systems adjacent work, motion, delivery with high-craft teams.',
      skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    },
    {
      id: 'aliva-shop',
      company: 'Aliva Shop',
      website: 'https://www.linkedin.com/company/alivashop',
      logo: '/logos/aliva-shop.webp',
      current: false,
      role: 'Frontend Developer',
      when: '06.2025 — 04.2026',
      type: 'Full-time',
      note: 'Led Q-commerce modernization: Angular → standalone + Signals; Ionic + Capacitor for iOS/Android.',
      skills: ['Angular', 'Ionic', 'RxJS', 'Signals', 'Capacitor', 'Architecture', 'Performance'],
    },
    {
      id: 'tensolite',
      company: 'Tensolite SA',
      website: 'https://tensolite.com',
      logo: '/logos/tensolite.webp',
      current: false,
      role: 'Full Stack Developer',
      when: '07.2023 — 11.2023',
      type: 'Full-time',
      note: 'Internal ops tools — Excel import/export, PDF generation, workflow automation.',
      skills: ['React', 'Node.js', 'Automation', 'Data Processing', 'Excel', 'PDF Generation'],
    },
    {
      id: 'doctor-qali',
      company: 'Doctor Qali',
      logo: '/logos/doctor-qali.webp',
      current: false,
      role: 'Frontend Developer',
      when: '01.2023 — 06.2023',
      type: 'Contract',
      note: 'HealthTech performance: render bottlenecks, bundle size, Lighthouse, modern React patterns.',
      skills: ['React', 'Performance', 'Refactoring', 'Frontend Architecture'],
    },
  ],
} as const

export type Identity = typeof IDENTITY

/** Spiral phrase built from the lexicon — readable as a loop of self. */
export function lexiconPhrase(sep = ' · '): string {
  return IDENTITY.lexicon.join(sep) + sep
}

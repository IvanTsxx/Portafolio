// content/identity.ts
// Canonical personal facts — humans read the prose; agents read the structured fields.

export const IDENTITY = {
  name: 'AX',
  role: 'Frontend Developer',
  year: '2026',
  location: {
    city: 'San Miguel de Tucumán',
    region: 'Tucumán',
    country: 'Argentina',
    short: 'Tucumán, AR',
  },
  tagline: 'Building at the edge of generative systems.',
  summary:
    'Frontend developer from Tucumán. I ship Next.js surfaces, agent tooling, and generative ASCII — work that reads clean to people and to agents.',
  openTo: 'Focused contracts',
  stack: ['Next.js', 'TypeScript', 'AI SDK', 'eve', 'Motion', 'Three'],
  focus: ['Generative UI', 'Agent surfaces', 'Edge delivery'],
  /** Words that appear in the live spiral — identity, place, stack. Not filler. */
  lexicon: [
    'TUCUMAN',
    'SAN MIGUEL',
    'CERRO',
    'YERBA',
    'AX',
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
    'NAME': 'AX',
    'ROLE': 'Frontend Developer',
    'LOC': 'Tucumán, AR',
    'STACK': 'Next 16 · TS strict · AI SDK · eve',
    'ASCII': 'live',
    'PORTAL': '900ms',
    'STATUS': 'open',
    'PREFERS': 'structured briefs · clear constraints · RSC-first',
  },
} as const

export type Identity = typeof IDENTITY

/** Spiral phrase built from the lexicon — readable as a loop of self. */
export function lexiconPhrase(sep = ' · '): string {
  return IDENTITY.lexicon.join(sep) + sep
}

// content/lab.ts — static ASCII studies (image → ASCII via external tool)
export interface LabStudy {
  slug: string
  index: string
  title: string
  year: string
  note: string
  /** Path under /public — converted ASCII .txt from image tool */
  asciiSrc: string | null
  /** Inline fallback while asciiSrc is empty / missing */
  placeholder: string
}

const FRAME = `
┌──────────────────────────┐
│                          │
│     ·  ·    ·   ·        │
│   ·    ASCII    ·        │
│     ·  study  ·          │
│   drop image→txt here    │
│                          │
└──────────────────────────┘
`.trim()

export const LAB: LabStudy[] = [
  {
    slug: 'portal-still',
    index: '001',
    title: 'Portal still',
    year: '2026',
    note: 'Frame from the wormhole — converted still, not a live field.',
    asciiSrc: null,
    placeholder: FRAME,
  },
  {
    slug: 'basement-desk',
    index: '002',
    title: 'Basement desk',
    year: '2026',
    note: 'Photo → ASCII. Swap in content when the convert tool runs.',
    asciiSrc: null,
    placeholder: FRAME,
  },
  {
    slug: 'tucuman-night',
    index: '003',
    title: 'Tucumán night',
    year: '2025',
    note: 'City light density as glyph ramp.',
    asciiSrc: null,
    placeholder: FRAME,
  },
  {
    slug: 'glyph-portrait',
    index: '004',
    title: 'Glyph portrait',
    year: '2025',
    note: 'Portrait pass through the image→ASCII pipeline.',
    asciiSrc: null,
    placeholder: FRAME,
  },
]

// content/work.ts — professional experience (not personal projects)
export interface WorkExperience {
  slug: string
  index: string
  company: string
  role: string
  when: string
  type: string
  summary: string
  tags: string[]
  website?: string
  logo?: string
  current?: boolean
}

export const WORK: WorkExperience[] = [
  {
    slug: 'basement-studio',
    index: '001',
    company: 'basement studio',
    role: 'Frontend Developer',
    when: '04.2026 — Present',
    type: 'Full-time',
    summary:
      'Product UI, design systems adjacent work, motion, and delivery with high-craft teams.',
    tags: ['Next.js', 'React', 'TypeScript', 'Motion'],
    website: 'https://basement.studio',
    logo: '/logos/basement.webp',
    current: true,
  },
  {
    slug: 'aliva-shop',
    index: '002',
    company: 'Aliva Shop',
    role: 'Frontend Developer',
    when: '06.2025 — 04.2026',
    type: 'Full-time',
    summary:
      'Led Q-commerce modernization: Angular → standalone + Signals; Ionic + Capacitor for iOS/Android.',
    tags: ['Angular', 'Ionic', 'Signals', 'Capacitor'],
    website: 'https://www.linkedin.com/company/alivashop',
    logo: '/logos/aliva-shop.webp',
  },
  {
    slug: 'tensolite',
    index: '003',
    company: 'Tensolite SA',
    role: 'Full Stack Developer',
    when: '07.2023 — 11.2023',
    type: 'Full-time',
    summary:
      'Internal ops tools — Excel import/export, PDF generation, workflow automation.',
    tags: ['React', 'Node.js', 'Automation'],
    website: 'https://tensolite.com',
    logo: '/logos/tensolite.webp',
  },
  {
    slug: 'doctor-qali',
    index: '004',
    company: 'Doctor Qali',
    role: 'Frontend Developer',
    when: '01.2023 — 06.2023',
    type: 'Contract',
    summary:
      'HealthTech performance: render bottlenecks, bundle size, Lighthouse, modern React patterns.',
    tags: ['React', 'Performance', 'Architecture'],
    logo: '/logos/doctor-qali.webp',
  },
]

export function getWork(slug: string): WorkExperience | undefined {
  return WORK.find((w) => w.slug === slug)
}

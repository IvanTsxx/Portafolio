// app/page.tsx — Portal home (wheel + wormhole). Iterate here.
import type { Metadata } from 'next'
import { PortalHome } from '@/components/home/portal/portal-home'
import { IDENTITY } from '@/content/identity'

export const metadata: Metadata = {
  title: 'AX — Frontend Developer',
  description: IDENTITY.summary,
}

export default function HomePage() {
  return <PortalHome />
}

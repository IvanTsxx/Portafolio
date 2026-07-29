// app/about/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { chamberSide } from '@/components/home/portal/content'

export const metadata: Metadata = {
  title: 'About',
}

export default function AboutPage() {
  return (
    <PortalPage label="Studio · basement + origin" side={chamberSide('about')}>
      <PageHeading>AX builds generative systems from Tucumán.</PageHeading>
      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
        Frontend developer based in San Miguel de Tucumán, Argentina. Specializing in
        Next.js, TypeScript, AI SDK tooling, and agent surfaces. This site is both
        portfolio and engine — ASCII cosmos, a wormhole portal, and chrome that stays
        readable to people and to agents.
      </p>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {[
          { k: 'LOCATION', v: 'San Miguel de Tucumán, Argentina' },
          { k: 'FOCUS', v: 'Generative UI · agent tooling · edge delivery' },
          { k: 'STACK', v: 'Next.js · TypeScript · AI SDK · Motion · Three' },
          { k: 'STATUS', v: 'Open to focused contracts' },
          { k: 'STUDIO', v: 'basement studio' },
          { k: 'AGENTS', v: 'Structured briefs · RSC-first · clear constraints' },
        ].map(({ k, v }) => (
          <div key={k}>
            <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
              {k}
            </dt>
            <dd className="text-[14px]" style={{ color: 'var(--p-bright)' }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </PortalPage>
  )
}

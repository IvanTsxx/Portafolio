// app/about/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { SocialLinks } from '@/components/site/social-links'
import { AsciiImage } from '@/components/ui/ascii-image'
import { chamberSide } from '@/components/home/portal/content'
import { IDENTITY } from '@/content/identity'
import { portal } from '@/lib/portal/styles'

export const metadata: Metadata = {
  title: 'About',
  description: IDENTITY.summary,
}

export default function AboutPage() {
  return (
    <PortalPage label={`${IDENTITY.studio} · origin`} side={chamberSide('about')}>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
        <AsciiImage
          src={IDENTITY.avatar}
          alt={IDENTITY.displayName}
          aspect="3 / 4"
          variant="field"
          className={portal.aboutPortrait}
        />
        <div className="min-w-0">
          <p className={`${portal.label} mb-2`}>
            {IDENTITY.handle} · {IDENTITY.role}
          </p>
          <PageHeading>
            {IDENTITY.short} builds generative systems from {IDENTITY.location.region}.
          </PageHeading>
        </div>
      </div>

      <p className={`${portal.body} mb-10`}>
        {IDENTITY.summary} This site is both portfolio and engine — ASCII cosmos, a wormhole
        portal, and chrome that stays readable to people and to agents.
      </p>

      <dl className="mb-14 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {[
          {
            k: 'LOCATION',
            v: `${IDENTITY.location.city}, ${IDENTITY.location.country}`,
          },
          { k: 'FOCUS', v: IDENTITY.focus.join(' · ') },
          { k: 'STACK', v: IDENTITY.stack.join(' · ') },
          { k: 'STATUS', v: IDENTITY.openTo },
          { k: 'STUDIO', v: IDENTITY.studio },
          { k: 'EMAIL', v: IDENTITY.email },
          { k: 'GITHUB', v: IDENTITY.socials.github.replace('https://', '') },
          { k: 'X', v: '@IvanTsxx' },
          { k: 'LINKEDIN', v: 'bongiovanni-ivan45' },
          { k: 'AGENTS', v: IDENTITY.agent.PREFERS },
        ].map(({ k, v }) => (
          <div key={k}>
            <dt className={`${portal.label} mb-2`}>{k}</dt>
            <dd className="text-[14px] text-p-bright">{v}</dd>
          </div>
        ))}
      </dl>

      <SocialLinks className="pb-8" />
    </PortalPage>
  )
}

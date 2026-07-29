// app/about/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { SocialLinks } from '@/components/site/social-links'
import { chamberSide } from '@/components/home/portal/content'
import { IDENTITY } from '@/content/identity'

export const metadata: Metadata = {
  title: 'About',
  description: IDENTITY.summary,
}

export default function AboutPage() {
  return (
    <PortalPage label={`${IDENTITY.studio} · origin`} side={chamberSide('about')}>
      <div className="mb-8 flex items-start gap-5">
        <Image
          src={IDENTITY.avatar}
          alt={IDENTITY.displayName}
          width={72}
          height={72}
          className="size-[72px] rounded-[4px] border border-[var(--p-line)] object-cover"
          priority
        />
        <div>
          <p className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            {IDENTITY.handle} · {IDENTITY.role}
          </p>
          <PageHeading>
            {IDENTITY.short} builds generative systems from {IDENTITY.location.region}.
          </PageHeading>
        </div>
      </div>

      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
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
            <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
              {k}
            </dt>
            <dd className="text-[14px]" style={{ color: 'var(--p-bright)' }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <p className="portal-mono mb-4" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
        Experience
      </p>
      <ul className="space-y-6 pb-8">
        {IDENTITY.experiences.map((e) => (
          <li key={e.id} className="flex gap-4">
            <Image
              src={e.logo}
              alt=""
              width={36}
              height={36}
              className="mt-0.5 size-9 rounded-[3px] border border-[var(--p-line)] object-contain"
            />
            <div>
              <p className="font-semibold" style={{ color: 'var(--p-bright)' }}>
                {e.company}
              </p>
              <p className="portal-mono mt-1" style={{ fontSize: 9, color: 'var(--p-dim)' }}>
                {e.role} · {e.when} · {e.type}
              </p>
              <p className="mt-1 text-[14px]" style={{ color: 'var(--p-mid)' }}>
                {e.note}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <SocialLinks className="portal-socials pb-8" />
    </PortalPage>
  )
}

// app/about/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { AsciiImage } from '@/components/ui/ascii-image'
import { chamberSide } from '@/components/home/portal/content'
import { IDENTITY } from '@/content/identity'
import { portal } from '@/lib/portal/styles'
import { cn } from '@/lib/utils'

const ABOUT_BIO =
  'Frontend developer building interfaces with Next.js and TypeScript — motion with Motion and GSAP, layout in Tailwind, design handoff through Figma. Increasingly working alongside AI agents: custom skills, MCP servers, and tools like Claude Code and Cursor as part of the actual workflow.'

const DETAIL_LINK_CLASS = cn(
  'text-p-bright underline-offset-2 transition-opacity duration-150',
  'hover:underline hover:opacity-75',
)

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
            {IDENTITY.handle} · {IDENTITY.role} · aka {IDENTITY.nickname}
          </p>
          <PageHeading>
            {IDENTITY.short} builds frontend, motion, and agent-native tooling from{' '}
            {IDENTITY.location.region}.
          </PageHeading>
        </div>
      </div>

      <p className={`${portal.body} mb-10`}>{ABOUT_BIO}</p>

      <dl className="mb-14 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {[
          {
            k: 'LOCATION',
            v: `${IDENTITY.location.city}, ${IDENTITY.location.country}`,
          },
          { k: 'FOCUS', v: IDENTITY.focus.join(' · ') },
          { k: 'STACK', v: IDENTITY.stack.join(' · ') },
          { k: 'EMAIL', v: IDENTITY.email, href: `mailto:${IDENTITY.email}` },
          {
            k: 'GITHUB',
            v: IDENTITY.socials.github.replace('https://', ''),
            href: IDENTITY.socials.github,
          },
          { k: 'X', v: '@IvanTsxx', href: IDENTITY.socials.twitter },
          {
            k: 'LINKEDIN',
            v: 'bongiovanni-ivan45',
            href: IDENTITY.socials.linkedin,
          },
        ].map(({ k, v, href }) => (
          <div key={k}>
            <dt className={`${portal.label} mb-2`}>{k}</dt>
            <dd className="text-[14px]">
              {href ? (
                <a
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className={DETAIL_LINK_CLASS}
                >
                  {v}
                </a>
              ) : (
                <span className="text-p-bright">{v}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </PortalPage>
  )
}

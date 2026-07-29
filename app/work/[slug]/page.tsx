// app/work/[slug]/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { getWork, WORK } from '@/content/work'
import { WorkBackLink } from './work-back-link'

export function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getWork(slug)
  if (!project) return { title: 'Work' }
  return { title: project.title }
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getWork(slug)
  if (!project) notFound()

  return (
    <PortalPage label={`Work · ${project.index}`}>
      <WorkBackLink />
      <PageHeading className="mt-6">{project.title}</PageHeading>
      <p className="mb-8 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
        {project.summary}
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            ROLE
          </dt>
          <dd style={{ color: 'var(--p-bright)', fontSize: 14 }}>{project.role}</dd>
        </div>
        <div>
          <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            YEAR
          </dt>
          <dd style={{ color: 'var(--p-bright)', fontSize: 14 }}>{project.year}</dd>
        </div>
        <div>
          <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            STACK
          </dt>
          <dd style={{ color: 'var(--p-bright)', fontSize: 14 }}>{project.tags.join(' · ')}</dd>
        </div>
      </dl>
    </PortalPage>
  )
}

// app/work/[slug]/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { chamberSide } from '@/components/home/portal/content'
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
  const job = getWork(slug)
  if (!job) return { title: 'Work' }
  return { title: `${job.company} · Work` }
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const job = getWork(slug)
  if (!job) notFound()

  return (
    <PortalPage label={`Work · ${job.index}`} side={chamberSide('work')}>
      <WorkBackLink />
      <PageHeading className="mt-6">{job.company}</PageHeading>
      <p className="mb-8 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
        {job.summary}
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            ROLE
          </dt>
          <dd style={{ color: 'var(--p-bright)', fontSize: 14 }}>{job.role}</dd>
        </div>
        <div>
          <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            WHEN
          </dt>
          <dd style={{ color: 'var(--p-bright)', fontSize: 14 }}>{job.when}</dd>
        </div>
        <div>
          <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            TYPE
          </dt>
          <dd style={{ color: 'var(--p-bright)', fontSize: 14 }}>{job.type}</dd>
        </div>
        <div className="sm:col-span-3">
          <dt className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            STACK
          </dt>
          <dd style={{ color: 'var(--p-bright)', fontSize: 14 }}>{job.tags.join(' · ')}</dd>
        </div>
      </dl>
      {job.website && (
        <a
          href={job.website}
          target="_blank"
          rel="noopener noreferrer"
          className="portal-link"
        >
          Visit →
        </a>
      )}
    </PortalPage>
  )
}

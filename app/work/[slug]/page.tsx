// app/work/[slug]/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { chamberSide } from '@/components/home/portal/content'
import { getWork, WORK } from '@/content/work'
import { portal } from '@/lib/portal/styles'
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
      <p className={`${portal.body} mb-8`}>{job.summary}</p>
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <dt className={`${portal.label} mb-2`}>ROLE</dt>
          <dd className="text-[14px] text-p-bright">{job.role}</dd>
        </div>
        <div>
          <dt className={`${portal.label} mb-2`}>WHEN</dt>
          <dd className="text-[14px] text-p-bright">{job.when}</dd>
        </div>
        <div>
          <dt className={`${portal.label} mb-2`}>TYPE</dt>
          <dd className="text-[14px] text-p-bright">{job.type}</dd>
        </div>
        <div className="sm:col-span-3">
          <dt className={`${portal.label} mb-2`}>STACK</dt>
          <dd className="text-[14px] text-p-bright">{job.tags.join(' · ')}</dd>
        </div>
      </dl>
      {job.website && (
        <a
          href={job.website}
          target="_blank"
          rel="noopener noreferrer"
          className={portal.link}
        >
          Visit →
        </a>
      )}
    </PortalPage>
  )
}

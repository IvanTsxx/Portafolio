// app/work/[slug]/page.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Label } from '@/components/primitives/label'
import { AsciiRule } from '@/lib/ascii/components/ascii-rule'
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
    <article
      className="w-full max-w-[var(--max-grid)] mx-auto pt-24 pb-20"
      style={{ paddingInline: 'var(--gutter)' }}
    >
      <WorkBackLink />

      <header className="mt-8 mb-10 max-w-[58ch]">
        <Label index={project.index} tone="signal" className="mb-4">
          {project.year}
        </Label>
        <h1
          className="font-sans font-semibold text-ax-bright mb-4"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            letterSpacing: '-0.035em',
            lineHeight: 0.97,
          }}
        >
          {project.title}
        </h1>
        <p className="font-sans text-ax-mid" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          {project.summary}
        </p>
      </header>

      <div className="mb-8">
        <AsciiRule className="opacity-30" />
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[58ch]">
        <div>
          <dt className="font-mono text-ax-dim mb-2" style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}>
            ROLE
          </dt>
          <dd className="font-sans text-ax-bright" style={{ fontSize: 'var(--text-sm)' }}>
            {project.role}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-ax-dim mb-2" style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}>
            YEAR
          </dt>
          <dd className="font-sans text-ax-bright" style={{ fontSize: 'var(--text-sm)' }}>
            {project.year}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-ax-dim mb-2" style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}>
            STACK
          </dt>
          <dd className="font-sans text-ax-bright" style={{ fontSize: 'var(--text-sm)' }}>
            {project.tags.join(' · ')}
          </dd>
        </div>
      </dl>
    </article>
  )
}

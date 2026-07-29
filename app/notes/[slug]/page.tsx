// app/notes/[slug]/page.tsx — RSC + compileMDX
import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { chamberSide } from '@/components/home/portal/content'
import { listNoteSlugs, getNote } from '@/lib/notes'
import { portal } from '@/lib/portal/styles'
import { NoteBackLink } from './note-back-link'
import '@/app/notes-code.css'

export async function generateStaticParams() {
  const slugs = await listNoteSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const note = await getNote(slug)
  if (!note) return { title: 'Notes' }
  return {
    title: note.frontmatter.title,
    description: note.frontmatter.excerpt,
  }
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const note = await getNote(slug)
  if (!note) notFound()

  const { frontmatter, content } = note

  return (
    <PortalPage label={`Notes · ${frontmatter.date}`} side={chamberSide('notes')} wide>
      <NoteBackLink />
      <PageHeading className="mt-6">
        {frontmatter.title}
      </PageHeading>
      <p className={`${portal.body} mb-8`}>
        {frontmatter.excerpt}
      </p>
      <div className="typeset typeset-notes">{content}</div>
    </PortalPage>
  )
}

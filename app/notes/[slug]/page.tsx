// app/notes/[slug]/page.tsx — RSC + compileMDX
import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Label } from '@/components/primitives/label'
import { AsciiRule } from '@/lib/ascii/components/ascii-rule'
import { listNoteSlugs, getNote } from '@/lib/notes'
import { NoteBackLink } from './note-back-link'

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
    <article
      className="w-full max-w-[var(--max-grid)] mx-auto pt-24 pb-20"
      style={{ paddingInline: 'var(--gutter)' }}
    >
      <NoteBackLink />

      <header className="mt-8 mb-8 max-w-[58ch]">
        <Label tone="dim" className="mb-4">
          {frontmatter.date}
        </Label>
        <h1
          className="font-sans font-semibold text-ax-bright mb-4"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            letterSpacing: '-0.035em',
            lineHeight: 0.97,
          }}
        >
          {frontmatter.title}
        </h1>
        <p className="font-sans text-ax-mid" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          {frontmatter.excerpt}
        </p>
      </header>

      <div className="mb-8 max-w-[58ch]">
        <AsciiRule className="opacity-30" />
      </div>

      <div className="max-w-[58ch]">{content}</div>
    </article>
  )
}

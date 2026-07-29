// app/notes/page.tsx — RSC
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { PortalLink } from '@/lib/portal/portal-link'
import { listNotes } from '@/lib/notes'

export const metadata: Metadata = {
  title: 'Notes',
}

export default async function NotesPage() {
  const notes = await listNotes()

  return (
    <PortalPage label="Notes · writing">
      <PageHeading>Notes on systems and motion</PageHeading>
      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'var(--p-mid)' }}>
        MDX with custom components — compiled on the server.
      </p>

      <ul className="flex flex-col gap-8" role="list">
        {notes.map((note) => (
          <li key={note.slug}>
            <PortalLink
              href={`/notes/${note.slug}`}
              label={note.title.toUpperCase()}
              className="block"
            >
              <span className="portal-mono block mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
                {note.date}
              </span>
              <span
                className="font-semibold block"
                style={{
                  color: 'var(--p-bright)',
                  fontSize: '1.15rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {note.title}
              </span>
              <span className="block mt-1 text-[14px]" style={{ color: 'var(--p-mid)' }}>
                {note.excerpt}
              </span>
            </PortalLink>
          </li>
        ))}
      </ul>
    </PortalPage>
  )
}

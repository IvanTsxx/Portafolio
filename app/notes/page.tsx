// app/notes/page.tsx — RSC
import * as React from 'react'
import type { Metadata } from 'next'
import { PageHeading } from '@/components/site/page-heading'
import { PortalPage } from '@/components/site/portal-page'
import { chamberSide } from '@/components/home/portal/content'
import { PortalLink } from '@/lib/portal/portal-link'
import { portal } from '@/lib/portal/styles'
import { listNotes } from '@/lib/notes'

export const metadata: Metadata = {
  title: 'Notes',
}

export default async function NotesPage() {
  const notes = await listNotes()

  return (
    <PortalPage label="Notes · writing" side={chamberSide('notes')} wide>
      <PageHeading>Notes on systems and motion</PageHeading>
      <p className={`${portal.body} mb-10`}>
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
              <span className={`${portal.label} mb-2 block`}>{note.date}</span>
              <span className={portal.titleLg}>{note.title}</span>
              <span className={`${portal.bodySm} mt-1 block`}>{note.excerpt}</span>
            </PortalLink>
          </li>
        ))}
      </ul>
    </PortalPage>
  )
}

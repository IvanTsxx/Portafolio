// app/notes/page.tsx — RSC
import * as React from 'react'
import type { Metadata } from 'next'
import { Label } from '@/components/primitives/label'
import { PortalLink } from '@/lib/portal/portal-link'
import { listNotes } from '@/lib/notes'

export const metadata: Metadata = {
  title: 'Notes',
}

export default async function NotesPage() {
  const notes = await listNotes()

  return (
    <div
      className="w-full max-w-[var(--max-grid)] mx-auto pt-24 pb-20"
      style={{ paddingInline: 'var(--gutter)' }}
    >
      <header className="mb-12 max-w-[52ch]">
        <Label index="NOTES" tone="signal" className="mb-4">
          Writing
        </Label>
        <h1
          className="font-sans font-semibold text-ax-bright mb-4"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            letterSpacing: '-0.035em',
            lineHeight: 0.97,
          }}
        >
          Notes on systems and motion
        </h1>
        <p className="font-sans text-ax-mid" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          MDX with custom components — compiled on the server via{' '}
          <code className="font-mono text-ax-bright">next-mdx-remote/rsc</code>.
        </p>
      </header>

      <ul className="flex flex-col" role="list">
        {notes.map((note) => (
          <li key={note.slug}>
            <PortalLink
              href={`/notes/${note.slug}`}
              label={note.title.toUpperCase()}
              className="group block py-5 border-t border-ax-line hover:border-ax-mid transition-colors"
              style={{ transitionDuration: 'var(--dur-micro)' }}
            >
              <span
                className="font-mono text-ax-dim block mb-2"
                style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}
              >
                {note.date}
              </span>
              <span
                className="font-sans text-ax-bright group-hover:text-ax-signal transition-colors block"
                style={{
                  fontSize: 'var(--text-lg)',
                  letterSpacing: '-0.02em',
                  transitionDuration: 'var(--dur-micro)',
                }}
              >
                {note.title}
              </span>
              <span
                className="font-sans text-ax-mid block mt-1"
                style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5, maxWidth: '52ch' }}
              >
                {note.excerpt}
              </span>
            </PortalLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

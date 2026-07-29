// lib/notes.ts
// Filesystem helpers for MDX notes — server-only.
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { noteComponents } from '@/components/mdx/note-components'
import { noteMdxOptions } from '@/lib/notes/mdx-options'

const NOTES_DIR = path.join(process.cwd(), 'content/notes')

export interface NoteFrontmatter {
  title: string
  date: string
  excerpt: string
}

export interface NoteMeta extends NoteFrontmatter {
  slug: string
}

async function readSource(slug: string): Promise<string | null> {
  try {
    return await readFile(path.join(NOTES_DIR, `${slug}.mdx`), 'utf8')
  } catch {
    return null
  }
}

export async function listNoteSlugs(): Promise<string[]> {
  const files = await readdir(NOTES_DIR)
  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
    .sort()
}

export async function listNotes(): Promise<NoteMeta[]> {
  const slugs = await listNoteSlugs()
  const notes = await Promise.all(
    slugs.map(async (slug) => {
      const source = await readSource(slug)
      if (!source) return null
      const { frontmatter } = await compileMDX<NoteFrontmatter>({
        source,
        options: { parseFrontmatter: true, mdxOptions: noteMdxOptions },
      })
      return { slug, ...frontmatter }
    }),
  )

  return notes
    .filter((n): n is NoteMeta => n != null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getNote(slug: string) {
  const source = await readSource(slug)
  if (!source) return null

  const { content, frontmatter } = await compileMDX<NoteFrontmatter>({
    source,
    components: noteComponents,
    options: { parseFrontmatter: true, mdxOptions: noteMdxOptions },
  })

  return { slug, content, frontmatter }
}

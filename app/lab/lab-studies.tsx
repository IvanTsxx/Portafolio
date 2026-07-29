// app/lab/lab-studies.tsx — personal project cards; ASCII frame (± photo hover)
import * as React from 'react'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { LAB, type LabStudy } from '@/content/lab'
import { AsciiImage } from '@/components/ui/ascii-image'
import { portal } from '@/lib/portal/styles'

async function loadAscii(src: string | null | undefined): Promise<string | null> {
  if (!src) return null
  try {
    const filePath = path.join(process.cwd(), 'public', src.replace(/^\//, ''))
    return await readFile(filePath, 'utf8')
  } catch {
    return null
  }
}

async function LabCard({ study }: { study: LabStudy }) {
  const ascii = await loadAscii(study.asciiSrc)
  const hasMedia = Boolean(study.imageSrc) || Boolean(ascii)

  return (
    <li>
      <p className={`${portal.label} mb-2`}>
        {study.index} · {study.year}
      </p>
      {hasMedia && (
        <AsciiImage
          src={study.imageSrc}
          alt={study.title}
          ascii={ascii}
          className="mb-3"
        />
      )}
      <h2 className={`${portal.titleLg} mb-1`}>{study.title}</h2>
      <p className={portal.bodySm}>{study.note}</p>
      <p className={`${portal.meta} mt-2`}>{study.tags.join(' · ')}</p>
    </li>
  )
}

export async function LabStudies() {
  return (
    <ul
      className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12"
      role="list"
    >
      {LAB.map((study) => (
        <LabCard key={study.slug} study={study} />
      ))}
    </ul>
  )
}

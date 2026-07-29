// app/lab/lab-studies.tsx — static ASCII from image converts (no live rAF fields)
import * as React from 'react'
import { LAB } from '@/content/lab'
import { AsciiStill } from './ascii-still'

export function LabStudies() {
  return (
    <ul className="flex flex-col gap-10" role="list">
      {LAB.map((study) => (
        <li key={study.slug}>
          <p className="portal-mono mb-2" style={{ fontSize: 10, color: 'var(--p-dim)' }}>
            {study.index} · {study.year}
          </p>
          <h2
            className="font-semibold mb-1"
            style={{ color: 'var(--p-bright)', letterSpacing: '-0.02em', fontSize: '1.15rem' }}
          >
            {study.title}
          </h2>
          <p className="mb-4 text-[14px]" style={{ color: 'var(--p-mid)' }}>
            {study.note}
          </p>
          <AsciiStill src={study.asciiSrc} fallback={study.placeholder} title={study.title} />
        </li>
      ))}
    </ul>
  )
}

// app/lab/ascii-still.tsx — RSC-friendly static <pre>; optional fetch of .txt
import * as React from 'react'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Renders a static ASCII study. Prefers public file from image→ASCII tool;
 * falls back to inline placeholder. Never mounts live canvas / rAF.
 */
export async function AsciiStill({
  src,
  fallback,
  title,
}: {
  src: string | null
  fallback: string
  title: string
}) {
  let art = fallback
  if (src) {
    try {
      const filePath = path.join(process.cwd(), 'public', src.replace(/^\//, ''))
      art = await readFile(filePath, 'utf8')
    } catch {
      art = fallback
    }
  }

  return (
    <pre
      aria-label={title}
      className="portal-ascii-still overflow-x-auto rounded-sm p-3 text-[10px] leading-[1.15] sm:text-[11px]"
      style={{
        color: 'var(--p-mid)',
        background: 'color-mix(in oklab, var(--p-void) 55%, transparent)',
        border: '1px solid color-mix(in oklab, var(--p-bright) 12%, transparent)',
        fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
        maxWidth: '100%',
      }}
    >
      {art}
    </pre>
  )
}

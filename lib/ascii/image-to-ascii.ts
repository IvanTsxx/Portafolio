// Sample an HTMLImageElement into a monospace ASCII frame (luminance → ramp).
import { RAMP_CLASSIC, densityToChar } from './ramps'

export type ImageToAsciiOptions = {
  cols?: number
  /** When set, overrides aspect-derived row count so the frame fills the box */
  rows?: number
  /** Aspect correction — monospace cells are taller than wide (used if rows omitted) */
  cellAspect?: number
  /** Match CSS object-fit: cover (default) vs stretch */
  fit?: 'cover' | 'fill'
  ramp?: string
}

/** Draw image into cols×rows with object-fit:cover crop. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cols: number,
  rows: number,
) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const ir = iw / ih
  const tr = cols / rows
  let sx = 0
  let sy = 0
  let sw = iw
  let sh = ih
  if (ir > tr) {
    sw = ih * tr
    sx = (iw - sw) / 2
  } else {
    sh = iw / tr
    sy = (ih - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows)
}

/**
 * Convert a loaded image into ASCII lines. Pure; caller owns the Image element.
 */
export function imageToAscii(
  img: HTMLImageElement,
  {
    cols = 56,
    rows: rowsOpt,
    cellAspect = 0.55,
    fit = 'cover',
    ramp = RAMP_CLASSIC,
  }: ImageToAsciiOptions = {},
): string {
  const srcW = img.naturalWidth || img.width
  const srcH = img.naturalHeight || img.height

  if (!srcW || !srcH) return ''

  const rows =
    rowsOpt ?? Math.max(8, Math.round(cols * (srcH / srcW) * cellAspect))
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return ''

  if (fit === 'cover') {
    drawCover(ctx, img, cols, rows)
  } else {
    ctx.drawImage(img, 0, 0, cols, rows)
  }

  const { data } = ctx.getImageData(0, 0, cols, rows)
  const lines: string[] = []

  for (let y = 0; y < rows; y++) {
    let line = ''
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4
      const r = data[i]!
      const g = data[i + 1]!
      const b = data[i + 2]!
      const a = data[i + 3]! / 255
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      const density = (1 - lum) * a
      line += densityToChar(density, ramp)
    }
    lines.push(line)
  }

  return lines.join('\n')
}

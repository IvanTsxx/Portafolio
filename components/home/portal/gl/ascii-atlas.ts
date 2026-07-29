export const ASCII_RAMP =
  ' .\'`^":;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'

export function buildAsciiAtlas(cell = 64) {
  const ramp = ASCII_RAMP
  const cols = ramp.length
  const canvas = document.createElement('canvas')
  canvas.width = cols * cell
  canvas.height = cell
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${Math.floor(cell * 0.72)}px ui-monospace, "Geist Mono", monospace`
  for (let i = 0; i < cols; i++) {
    const ch = ramp[i]!
    if (ch === ' ') continue
    ctx.fillText(ch, i * cell + cell / 2, cell / 2 + 1)
  }
  return { canvas, cols, cell, rampLength: cols }
}

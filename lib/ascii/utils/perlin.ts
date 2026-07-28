// lib/ascii/utils/perlin.ts
// Pure Perlin noise — no dependencies. Seeded via mulberry32.
// Implements 2D and 3D noise. Output in [-1, 1].

const PERLIN_YWRAPB = 4
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB
const PERLIN_ZWRAPB = 8
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB
const PERLIN_SIZE = 4095
const PERLIN_AMT = 0.5

let _perlin: Float32Array | null = null

function _sinCosFactor(x: number): number {
  return 0.5 * (1 - Math.cos(x * Math.PI))
}

function _lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

/**
 * Initialises the permutation table. Call once before using noise().
 * Seed defaults to 42 for deterministic results.
 */
export function initPerlin(seed = 42): void {
  _perlin = new Float32Array(PERLIN_SIZE + 1)
  // Deterministic fill using xorshift from seed
  let s = seed ^ 0xdeadbeef
  for (let i = 0; i <= PERLIN_SIZE; i++) {
    s ^= s << 13
    s ^= s >> 17
    s ^= s << 5
    _perlin[i] = (s >>> 0) / 0xffffffff
  }
}

/**
 * 2D Perlin noise. Returns a value in [0, 1].
 * Initialises the table on first call.
 */
export function noise2(x: number, y: number): number {
  if (!_perlin) initPerlin()
  const p = _perlin!

  if (x < 0) x = -x
  if (y < 0) y = -y

  let xi = Math.floor(x)
  let yi = Math.floor(y)
  let xf = x - xi
  let yf = y - yi
  let rxf: number, ryf: number
  let n1: number, n2: number, n3: number

  const r = 0
  let of_ = xi + yi * PERLIN_YWRAP

  rxf = _sinCosFactor(xf)
  ryf = _sinCosFactor(yf)

  n1 = p[(of_ & PERLIN_SIZE)]
  n1 += rxf * (p[((of_ + 1) & PERLIN_SIZE)] - n1)
  n2 = p[((of_ + PERLIN_YWRAP) & PERLIN_SIZE)]
  n2 += rxf * (p[((of_ + PERLIN_YWRAP + 1) & PERLIN_SIZE)] - n2)
  n1 += ryf * (n2 - n1)

  of_ += PERLIN_ZWRAP
  n2 = p[(of_ & PERLIN_SIZE)]
  n2 += rxf * (p[((of_ + 1) & PERLIN_SIZE)] - n2)
  n3 = p[((of_ + PERLIN_YWRAP) & PERLIN_SIZE)]
  n3 += rxf * (p[((of_ + PERLIN_YWRAP + 1) & PERLIN_SIZE)] - n3)
  n2 += ryf * (n3 - n2)

  return _lerp(n1, n2, _sinCosFactor(0)) * PERLIN_AMT + PERLIN_AMT
}

/**
 * 3D Perlin noise. Third dimension often used for time.
 * Returns a value in [0, 1].
 */
export function noise3(x: number, y: number, z: number): number {
  if (!_perlin) initPerlin()
  const p = _perlin!

  if (x < 0) x = -x
  if (y < 0) y = -y
  if (z < 0) z = -z

  let xi = Math.floor(x)
  let yi = Math.floor(y)
  let zi = Math.floor(z)
  let xf = x - xi
  let yf = y - yi
  let zf = z - zi
  let rxf: number, ryf: number
  let n1: number, n2: number, n3: number

  rxf = _sinCosFactor(xf)
  ryf = _sinCosFactor(yf)

  let of_ = xi + yi * PERLIN_YWRAP + zi * PERLIN_ZWRAP

  n1 = p[(of_ & PERLIN_SIZE)]
  n1 += rxf * (p[((of_ + 1) & PERLIN_SIZE)] - n1)
  n2 = p[((of_ + PERLIN_YWRAP) & PERLIN_SIZE)]
  n2 += rxf * (p[((of_ + PERLIN_YWRAP + 1) & PERLIN_SIZE)] - n2)
  n1 += ryf * (n2 - n1)

  of_ += PERLIN_ZWRAP
  n2 = p[(of_ & PERLIN_SIZE)]
  n2 += rxf * (p[((of_ + 1) & PERLIN_SIZE)] - n2)
  n3 = p[((of_ + PERLIN_YWRAP) & PERLIN_SIZE)]
  n3 += rxf * (p[((of_ + PERLIN_YWRAP + 1) & PERLIN_SIZE)] - n3)
  n2 += ryf * (n3 - n2)
  n1 += _sinCosFactor(zf) * (n2 - n1)

  return n1 * PERLIN_AMT + PERLIN_AMT
}

/**
 * Curl noise from 2D Perlin — gives a divergence-free 2D vector field.
 * Returns [vx, vy] normalized to [-1, 1].
 */
export function curl2(x: number, y: number, t: number, eps = 0.01): [number, number] {
  const n1 = noise3(x, y + eps, t)
  const n2 = noise3(x, y - eps, t)
  const n3 = noise3(x + eps, y, t)
  const n4 = noise3(x - eps, y, t)
  const vx = (n1 - n2) / (2 * eps)
  const vy = -(n3 - n4) / (2 * eps)
  return [vx, vy]
}

'use client'

import * as React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildAsciiAtlas, ASCII_RAMP } from './ascii-atlas'
import { ASCII_VERT, ASCII_FRAG } from './ascii-shader'
import type { PortalTheme } from '../content'

export type TravelJob = {
  duration: number
  fromCharge: number
  startLand: number
  landMood: number
  returning: boolean
  /** End with land=0 (route hop) instead of leaving landed ambient */
  exitClear?: boolean
  onMid?: () => void
  onDone: () => void
}

export type AsciiWorldApi = {
  setCharge: (v: number) => void
  setLand: (v: number) => void
  setLandMood: (v: number) => void
  getTravel: () => { worm: number; charge: number; land: number }
  startTravel: (
    job: Omit<TravelJob, 'startLand'> & { startLand?: number },
  ) => void
  cancelTravel: () => void
  setPalette: (theme: PortalTheme) => void
}

type Uniforms = {
  uTime: { value: number }
  uRes: { value: THREE.Vector2 }
  uPointer: { value: THREE.Vector2 }
  uPointerActive: { value: number }
  uWorm: { value: number }
  uCharge: { value: number }
  uLand: { value: number }
  uLandMood: { value: number }
  uBg: { value: THREE.Color }
  uFg: { value: THREE.Color }
  /** Scales glyph mix so copy stays readable over the field (light needs more room). */
  uGlyphGain: { value: number }
  uCell: { value: number }
  uAtlas: { value: THREE.Texture | null }
  uAtlasLen: { value: number }
}

function glyphGainFor(theme: PortalTheme) {
  return theme === 'dark' ? 0.58 : 0.32
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function FieldMesh({
  theme,
  apiRef,
  cell,
}: {
  theme: PortalTheme
  apiRef: React.MutableRefObject<AsciiWorldApi | null>
  cell: number
}) {
  const mat = React.useRef<THREE.ShaderMaterial>(null)
  const travel = React.useRef({ worm: 0, charge: 0, land: 0 })
  const jobRef = React.useRef<(TravelJob & { t0: number; midFired: boolean }) | null>(null)
  const pointerUv = React.useRef({ x: 0.5, y: 0.5, active: 0 })
  const { size, gl } = useThree()
  const reduced = React.useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const uniforms = React.useMemo<Uniforms>(() => {
    const atlas = buildAsciiAtlas(48)
    const tex = new THREE.CanvasTexture(atlas.canvas)
    tex.magFilter = THREE.NearestFilter
    tex.minFilter = THREE.NearestFilter
    tex.generateMipmaps = false
    tex.needsUpdate = true
    return {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerActive: { value: 0 },
      uWorm: { value: 0 },
      uCharge: { value: 0 },
      uLand: { value: 0 },
      uLandMood: { value: 0 },
      uBg: { value: new THREE.Color(theme === 'dark' ? '#0c0b0a' : '#e8e4dc') },
      uFg: { value: new THREE.Color(theme === 'dark' ? '#e8e4dc' : '#1a1816') },
      uGlyphGain: { value: glyphGainFor(theme) },
      uCell: { value: cell },
      uAtlas: { value: tex },
      uAtlasLen: { value: ASCII_RAMP.length },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const apply = (worm: number, charge: number, land: number) => {
      travel.current = { worm, charge, land }
      const u = mat.current?.uniforms
      if (!u) return
      u.uWorm!.value = worm
      u.uCharge!.value = charge
      u.uLand!.value = land
    }

    apiRef.current = {
      setCharge: (v) => {
        travel.current.charge = v
        if (mat.current) mat.current.uniforms.uCharge!.value = v
      },
      setLand: (v) => {
        travel.current.land = v
        if (mat.current) mat.current.uniforms.uLand!.value = v
      },
      setLandMood: (v) => {
        if (mat.current) mat.current.uniforms.uLandMood!.value = v
      },
      getTravel: () => ({ ...travel.current }),
      startTravel: (opts) => {
        const startLand = opts.startLand ?? travel.current.land
        if (mat.current) mat.current.uniforms.uLandMood!.value = opts.landMood
        jobRef.current = {
          duration: opts.duration,
          fromCharge: opts.fromCharge,
          startLand,
          landMood: opts.landMood,
          returning: opts.returning,
          exitClear: opts.exitClear,
          onMid: opts.onMid,
          onDone: opts.onDone,
          t0: performance.now(),
          midFired: false,
        }
        apply(opts.fromCharge, opts.fromCharge, startLand)
      },
      cancelTravel: () => {
        jobRef.current = null
      },
      setPalette: (t) => {
        const u = mat.current?.uniforms
        if (!u) return
        u.uBg!.value.set(t === 'dark' ? '#0c0b0a' : '#e8e4dc')
        u.uFg!.value.set(t === 'dark' ? '#e8e4dc' : '#1a1816')
        u.uGlyphGain!.value = glyphGainFor(t)
      },
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef])

  React.useEffect(() => {
    apiRef.current?.setPalette(theme)
  }, [apiRef, theme])

  React.useEffect(() => {
    // Content layer sits above the canvas — track pointer on the window
    const onMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      pointerUv.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1 - (e.clientY - rect.top) / rect.height,
        active: 1,
      }
    }
    const onLeave = () => {
      pointerUv.current.active = 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      uniforms.uAtlas.value?.dispose()
    }
  }, [gl, uniforms])

  useFrame((_, dt) => {
    if (!mat.current) return
    const u = mat.current.uniforms
    if (!reduced) u.uTime!.value += Math.min(dt, 0.033)
    u.uRes!.value.set(size.width, size.height)
    u.uPointer!.value.set(pointerUv.current.x, pointerUv.current.y)
    u.uPointerActive!.value = pointerUv.current.active

    const job = jobRef.current
    if (!job) return

    const p = Math.min(1, (performance.now() - job.t0) / job.duration)
    let worm = 0
    let charge = 0
    let land = job.startLand

    if (p < 0.28) {
      const e = easeInOut(p / 0.28)
      worm = job.fromCharge + (1 - job.fromCharge) * e
      charge = worm
      if (job.returning) land = job.startLand * (1 - e)
    } else if (p < 0.52) {
      worm = 1
      charge = 0
      if (job.returning) land = job.startLand * 0.15
      if (!job.midFired) {
        job.midFired = true
        job.onMid?.()
      }
    } else {
      const e = easeInOut((p - 0.52) / 0.48)
      worm = 1 - e
      charge = 0
      land = job.returning || job.exitClear
        ? (1 - e) * 0.04
        : Math.max(job.startLand, e)
    }

    travel.current = { worm, charge, land }
    u.uWorm!.value = worm
    u.uCharge!.value = charge
    u.uLand!.value = land

    if (p >= 1) {
      jobRef.current = null
      const endLand = job.returning || job.exitClear ? 0 : 1
      travel.current = { worm: 0, charge: 0, land: endLand }
      u.uWorm!.value = 0
      u.uCharge!.value = 0
      u.uLand!.value = endLand
      if (!job.returning && !job.exitClear) u.uLandMood!.value = job.landMood
      const done = job.onDone
      queueMicrotask(done)
    }
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={ASCII_VERT}
        fragmentShader={ASCII_FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

export function AsciiWorld({
  theme,
  cell = 16,
  apiRef,
  className,
}: {
  theme: PortalTheme
  cell?: number
  apiRef: React.MutableRefObject<AsciiWorldApi | null>
  className?: string
}) {
  const bg = theme === 'dark' ? '#0c0b0a' : '#e8e4dc'
  return (
    <div className={className} style={{ background: bg }}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        dpr={1}
        flat
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
        }}
        style={{ width: '100%', height: '100%', background: bg }}
      >
        <color attach="background" args={[bg]} />
        <FieldMesh theme={theme} apiRef={apiRef} cell={cell} />
      </Canvas>
    </div>
  )
}

'use client'

import * as React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { lexiconPhrase } from '@/content/identity'

type Impulse = { x: number; y: number; t: number }

const CHARS = lexiconPhrase().repeat(6).split('')

export interface LexiconVortexProps {
  className?: string
}

/**
 * Personal lexicon as a 3D spiral.
 * Pointer tilts · click&hold pulls in · click kicks · page scroll stays free (no wheel hijack).
 */
export function LexiconVortex({ className }: LexiconVortexProps) {
  const [holding, setHolding] = React.useState(false)
  const pullRef = React.useRef(0)
  const impulses = React.useRef<Impulse[]>([])

  return (
    <div
      className={className}
      onPointerDown={() => setHolding(true)}
      onPointerUp={() => setHolding(false)}
      onPointerLeave={() => setHolding(false)}
      onPointerCancel={() => setHolding(false)}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        impulses.current.push({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
          t: performance.now() / 1000,
        })
        if (impulses.current.length > 8) impulses.current.shift()
      }}
      role="img"
      aria-label="Interactive spiral of personal lexicon: Tucumán, stack, and practice words. Click and hold to pull in."
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#050505' }}
      >
        <color attach="background" args={['#050505']} />
        <SpiralScene holding={holding} pullRef={pullRef} impulses={impulses} />
      </Canvas>

      <p className="pointer-events-none absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.14em] text-ax-dim">
        {holding ? 'Pulling into lexicon…' : 'Click & hold · move to tilt'}
      </p>
    </div>
  )
}

function SpiralScene({
  holding,
  pullRef,
  impulses,
}: {
  holding: boolean
  pullRef: React.MutableRefObject<number>
  impulses: React.MutableRefObject<Impulse[]>
}) {
  const group = React.useRef<THREE.Group>(null)
  const { camera, pointer } = useThree()
  const spin = React.useRef(0)
  const reduced = React.useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useFrame((_state, dt) => {
    const targetPull = holding ? 1 : 0
    pullRef.current += (targetPull - pullRef.current) * Math.min(1, dt * 4)

    spin.current += dt * (0.12 + pullRef.current * 0.5)
    const now = performance.now() / 1000

    let kickX = 0
    let kickY = 0
    impulses.current = impulses.current.filter((imp) => now - imp.t < 1.2)
    for (const imp of impulses.current) {
      const age = now - imp.t
      const w = Math.exp(-age * 3.2)
      kickX += imp.x * w * 0.9
      kickY += imp.y * w * 0.9
    }

    if (group.current) {
      group.current.rotation.z = spin.current
      if (!reduced) {
        group.current.rotation.x = pointer.y * 0.35 + kickY * 0.4
        group.current.rotation.y = pointer.x * 0.45 + kickX * 0.4
      }
      const s = 1 + pullRef.current * 0.5
      group.current.scale.setScalar(s)
    }

    const z = 6.2 - pullRef.current * 2.6
    camera.position.z += (z - camera.position.z) * Math.min(1, dt * 3.5)
    if (!reduced) {
      camera.position.x += (pointer.x * 0.3 - camera.position.x) * Math.min(1, dt * 2)
      camera.position.y += (pointer.y * 0.22 - camera.position.y) * Math.min(1, dt * 2)
    }
    camera.lookAt(0, 0, 0)
  })

  const points = React.useMemo(() => {
    const out: { pos: [number, number, number]; char: string; size: number }[] = []
    const turns = 7
    const n = CHARS.length
    for (let i = 0; i < n; i++) {
      const u = i / n
      const angle = u * turns * Math.PI * 2
      const r = 0.15 + u * 2.55
      out.push({
        pos: [Math.cos(angle) * r, Math.sin(angle) * r, (u - 0.5) * -1.8],
        char: CHARS[i]!,
        size: 0.065 + (1 - u) * 0.04,
      })
    }
    return out
  }, [])

  const charset = React.useMemo(
    () => [...new Set(CHARS.filter((c) => c.trim()))].join(''),
    [],
  )

  return (
    <group ref={group}>
      {points.map((p, i) => (
        <Text
          key={i}
          position={p.pos}
          fontSize={p.size}
          color="#EDEDED"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.35 + (1 - i / points.length) * 0.55}
          characters={charset}
        >
          {p.char}
        </Text>
      ))}
      <Html center style={{ pointerEvents: 'none' }}>
        <div
          className="border border-white/20 bg-black/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm"
          style={{
            opacity: holding ? 0 : 1,
            transition: 'opacity 180ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          Click &amp; hold
        </div>
      </Html>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
    </group>
  )
}

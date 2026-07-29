// app/lab/lab-explorations.tsx — client island for live ASCII fields
'use client'

import * as React from 'react'
import { Frame } from '@/components/primitives/frame'
import { Label } from '@/components/primitives/label'
import { AsciiCanvas } from '@/lib/ascii/components/ascii-canvas'
import { PhyllotaxisCanvas } from '@/lib/ascii/components/phyllotaxis-canvas'
import { BarnsleyCanvas } from '@/lib/ascii/components/barnsley-canvas'
import {
  makeWaveField,
  makeFlowField,
  makeMoireField,
  makeLissajousField,
  RAMP_CLASSIC,
  RAMP_BLOCKS,
  RAMP_DOTS,
  RAMP_TECH,
} from '@/lib/ascii'

const waveField = makeWaveField()
const flowField = makeFlowField()
const moireField = makeMoireField()
const lissajousField = makeLissajousField({ samples: 256 })

const EXPLORATIONS = [
  {
    id: '001',
    title: 'Phyllotaxis',
    blurb: 'Golden-angle spiral · buffer precalc · O(cells)/frame',
    render: () => <PhyllotaxisCanvas className="h-48 w-full text-ax-dim" />,
  },
  {
    id: '002',
    title: 'Wave',
    blurb: 'Two interfering plane waves · pure O(1)/cell',
    render: () => (
      <AsciiCanvas fieldFn={waveField} ramp={RAMP_TECH} className="h-48 w-full text-ax-dim" />
    ),
  },
  {
    id: '003',
    title: 'Flow',
    blurb: 'Curl-noise density · Perlin 3D · seeded table',
    render: () => (
      <AsciiCanvas fieldFn={flowField} ramp={RAMP_CLASSIC} className="h-48 w-full text-ax-dim" />
    ),
  },
  {
    id: '004',
    title: 'Moiré',
    blurb: 'Concentric ring beat frequency · optical interference',
    render: () => (
      <AsciiCanvas fieldFn={moireField} ramp={RAMP_DOTS} className="h-48 w-full text-ax-dim" />
    ),
  },
  {
    id: '005',
    title: 'Lissajous',
    blurb: 'Distance field to parametric curve · samples capped',
    render: () => (
      <AsciiCanvas
        fieldFn={lissajousField}
        ramp={RAMP_BLOCKS}
        className="h-48 w-full text-ax-dim"
      />
    ),
  },
  {
    id: '006',
    title: 'Barnsley',
    blurb: 'IFS fern · density buffer · slow drift modulate',
    render: () => <BarnsleyCanvas className="h-48 w-full text-ax-dim" />,
  },
] as const

export function LabExplorations() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {EXPLORATIONS.map((item) => (
        <Frame
          key={item.id}
          contentPadding="none"
          header={
            <>
              <Label index={item.id} tone="dim">
                {item.title}
              </Label>
              <span
                className="font-mono text-ax-dim ml-auto truncate"
                style={{ fontSize: 'var(--text-2xs)', letterSpacing: '0.08em' }}
              >
                {item.blurb}
              </span>
            </>
          }
        >
          {item.render()}
        </Frame>
      ))}
    </div>
  )
}

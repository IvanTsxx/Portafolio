// lib/ascii/index.ts
// Public API of the ASCII engine.

export { RafProvider, useRaf }               from './raf-provider'
export { useAsciiGrid }                       from './hooks/use-ascii-grid'
export { useAsciiField }                      from './hooks/use-ascii-field'
export { useAsciiFrame }                      from './hooks/use-ascii-frame'
export { useAsciiPointer }                    from './hooks/use-ascii-pointer'
export { useReducedMotion }                   from './hooks/use-reduced-motion'
export { AsciiCanvas }                        from './components/ascii-canvas'
export { AsciiRule }                          from './components/ascii-rule'

export {
  RAMP_CLASSIC,
  RAMP_BLOCKS,
  RAMP_DOTS,
  RAMP_TECH,
  RAMP_ORGANIC,
  densityToChar,
  densityToIndex,
}                                             from './ramps'

export {
  makeWaveField,
  waveStaticFrame,
}                                             from './fields/wave'

export {
  makeFlowField,
  flowStaticFrame,
}                                             from './fields/flow'

export {
  makeMoireField,
  moireStaticFrame,
}                                             from './fields/moire'

export {
  makeLissajousField,
  lissajousStaticFrame,
}                                             from './fields/lissajous'

export {
  buildBarnsleyBuffer,
  makeBarnsleyField,
  barnsleyStaticFrame,
}                                             from './fields/barnsley'

export {
  buildPhyllotaxisBuffer,
  makePhyllotaxisField,
  phyllotaxisStaticFrame,
}                                             from './fields/phyllotaxis'

export { mulberry32, seededFloat, seededInt } from './utils/mulberry32'
export { noise2, noise3, curl2, initPerlin }  from './utils/perlin'
export { bayerThreshold, ditherChar, ditherLine } from './utils/dither'

export type {
  Density,
  FieldFn,
  FieldMeta,
  PointerState,
  AsciiGridOptions,
  AsciiFrame,
  PortalState,
  PortalOrigin,
  RampString,
  AsciiFieldControls,
  UseAsciiFieldResult,
}                                             from './types'

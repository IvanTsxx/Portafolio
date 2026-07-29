// lib/cuelume.ts — thin client helpers around cuelume (SSR-safe imports).
'use client'

import { bind, play, setEnabled, setVolume, type SoundName } from 'cuelume'

const MUTE_KEY = 'ax-cuelume-muted'
const VOL_KEY = 'ax-cuelume-volume'

export type { SoundName }

export function cue(name: SoundName, volume?: number) {
  play(name, volume !== undefined ? { volume } : undefined)
}

export function initCuelume() {
  bind()
  if (typeof window === 'undefined') return

  const muted = window.localStorage.getItem(MUTE_KEY) === '1'
  setEnabled(!muted)

  const raw = window.localStorage.getItem(VOL_KEY)
  if (raw != null) {
    const v = Number(raw)
    if (Number.isFinite(v)) setVolume(v)
  }
}

export function isCuelumeMuted(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(MUTE_KEY) === '1'
}

export function setCuelumeMuted(muted: boolean) {
  setEnabled(!muted)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  }
}

export function setCuelumeVolume(volume: number) {
  setVolume(volume)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(VOL_KEY, String(volume))
  }
}

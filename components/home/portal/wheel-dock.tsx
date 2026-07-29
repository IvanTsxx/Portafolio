'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Orbit, X } from 'lucide-react'
import { useReducedMotion } from '@/lib/ascii/hooks/use-reduced-motion'
import { HalfWheel } from './half-wheel'
import { DESTINATIONS, type DestId } from './content'
import { portal } from '@/lib/portal/styles'

/** Drawer-height ease — strong ease-out, no spin */
const EASE_REVEAL = [0.25, 1, 0.5, 1] as const
const EASE_STOW = [0.32, 0.72, 0, 1] as const

const FADE = { duration: 0.14, ease: 'easeOut' as const }

function useFineHover() {
  const [fine, setFine] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return fine
}

/**
 * Collapsible destination wheel.
 *
 * Desktop (fine pointer): hover opens, leave closes.
 * Touch / coarse: tap chip opens (pinned); close via X, scrim, or tap outside.
 */
export function WheelDock({
  active,
  hover,
  chargeRef,
  onHover,
  onHoldStart,
  onHoldEnd,
  disabled,
  locked,
}: {
  active: DestId
  hover: DestId
  chargeRef: React.MutableRefObject<number>
  onHover: (id: DestId) => void
  onHoldStart: (id: DestId) => void
  onHoldEnd: () => void
  disabled?: boolean
  locked?: boolean
}) {
  const rm = useReducedMotion()
  const fineHover = useFineHover()
  const [open, setOpen] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  /** True when the last open came from touch/pen — forces scrim + X even on hybrid devices */
  const [touchSession, setTouchSession] = React.useState(false)
  const leaveTimer = React.useRef(0)
  const dockRef = React.useRef<HTMLDivElement>(null)

  const activeLabel =
    DESTINATIONS.find((d) => d.id === active)?.label ?? 'Navigate'

  /** Hover-driven open/close only when a mouse can leave the dock */
  const hoverMode = fineHover && !touchSession
  /** Explicit dismiss UI: mobile, or anything opened by tap */
  const needsDismissUi = open && (!hoverMode || pinned)

  const clearLeave = React.useCallback(() => {
    window.clearTimeout(leaveTimer.current)
  }, [])

  const expand = React.useCallback(() => {
    clearLeave()
    setOpen(true)
  }, [clearLeave])

  const forceCollapse = React.useCallback(() => {
    clearLeave()
    setPinned(false)
    setTouchSession(false)
    setOpen(false)
  }, [clearLeave])

  const scheduleCollapse = React.useCallback(() => {
    if (locked || pinned || touchSession) return
    clearLeave()
    leaveTimer.current = window.setTimeout(() => {
      if (!locked) setOpen(false)
    }, 220)
  }, [clearLeave, locked, pinned, touchSession])

  React.useEffect(() => {
    if (locked) {
      clearLeave()
      setOpen(true)
    }
  }, [locked, clearLeave])

  React.useEffect(() => {
    if (!disabled) return
    forceCollapse()
  }, [disabled, forceCollapse])

  React.useEffect(() => () => clearLeave(), [clearLeave])

  React.useEffect(() => {
    if (!open || !needsDismissUi) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || locked) return
      forceCollapse()
    }

    const onPointerDown = (e: PointerEvent) => {
      if (locked) return
      const root = dockRef.current
      if (!root || root.contains(e.target as Node)) return
      forceCollapse()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, needsDismissUi, locked, forceCollapse])

  const openFromPointer = (e: React.PointerEvent) => {
    if (disabled) return
    const touch = e.pointerType === 'touch' || e.pointerType === 'pen'
    if (touch || !fineHover) {
      setTouchSession(true)
      setPinned(true)
    }
    expand()
  }

  const toggleFromClick = (e: React.MouseEvent) => {
    // Click after pointerdown — if already open+pinned (shouldn't happen on chip), ignore.
    // Primary open path is openFromPointer; click covers keyboard activation.
    if (disabled) return
    if (e.detail === 0) {
      // keyboard
      setPinned(true)
      expand()
    }
  }

  return (
    <>
      <AnimatePresence initial={false}>
        {needsDismissUi ? (
          <motion.button
            key="wheel-scrim"
            type="button"
            className={portal.wheelScrim}
            aria-label="Cerrar rueda de destinos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
            onClick={() => {
              if (!locked) forceCollapse()
            }}
          />
        ) : null}
      </AnimatePresence>

      <div
        ref={dockRef}
        className={portal.wheelDock}
        data-open={open ? '' : undefined}
        data-pinned={pinned ? '' : undefined}
        data-touch={touchSession ? '' : undefined}
        onPointerEnter={() => {
          if (hoverMode && !disabled) expand()
        }}
        onPointerLeave={() => {
          if (hoverMode) scheduleCollapse()
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          {!open ? (
            <motion.button
              key="wheel-trigger"
              type="button"
              className={portal.wheelTrigger}
              aria-label={`Abrir rueda de destinos — ${activeLabel}`}
              aria-expanded={false}
              disabled={disabled}
              initial={rm ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={rm ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={
                rm
                  ? { opacity: 0, transition: FADE }
                  : {
                      opacity: 0,
                      y: 8,
                      transition: { duration: 0.16, ease: EASE_STOW },
                    }
              }
              transition={
                rm ? FADE : { duration: 0.28, ease: EASE_REVEAL }
              }
              onPointerDown={openFromPointer}
              onClick={toggleFromClick}
              whileTap={rm ? undefined : { scale: 0.96 }}
            >
              <span className={portal.wheelTriggerGlyph} aria-hidden>
                <Orbit strokeWidth={1.75} />
              </span>
              <span className={portal.wheelTriggerLabel}>{activeLabel}</span>
              <span className={portal.wheelTriggerDot} aria-hidden />
            </motion.button>
          ) : (
            <motion.div
              key="wheel-panel"
              className={portal.wheelPanel}
              role="dialog"
              aria-label="Rueda de destinos"
              aria-modal={needsDismissUi}
              initial={
                rm
                  ? { opacity: 0 }
                  : {
                      clipPath: 'inset(100% 0 0 0)',
                      opacity: 1,
                    }
              }
              animate={
                rm
                  ? { opacity: 1 }
                  : {
                      clipPath: 'inset(0% 0 0 0)',
                      opacity: 1,
                    }
              }
              exit={
                rm
                  ? { opacity: 0, transition: FADE }
                  : {
                      clipPath: 'inset(100% 0 0 0)',
                      opacity: 1,
                      transition: { duration: 0.32, ease: EASE_STOW },
                    }
              }
              transition={
                rm ? FADE : { duration: 0.4, ease: EASE_REVEAL }
              }
            >
              {needsDismissUi ? (
                <button
                  type="button"
                  className={portal.wheelDismiss}
                  aria-label="Cerrar rueda de destinos"
                  onClick={forceCollapse}
                >
                  <X strokeWidth={1.75} aria-hidden />
                </button>
              ) : null}
              <HalfWheel
                active={active}
                hover={hover}
                chargeRef={chargeRef}
                disabled={disabled}
                onHover={onHover}
                onHoldStart={(id) => {
                  setPinned(true)
                  onHoldStart(id)
                }}
                onHoldEnd={() => {
                  onHoldEnd()
                  // Hover mode: unpin so leave can close. Touch: stay until X/scrim.
                  if (hoverMode) setPinned(false)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

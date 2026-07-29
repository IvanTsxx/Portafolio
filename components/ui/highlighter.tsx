'use client'

import { useLayoutEffect, useRef } from 'react'
import type React from 'react'
import { useInView } from 'motion/react'
import { annotate } from 'rough-notation'
import { type RoughAnnotation } from 'rough-notation/lib/model'

type AnnotationAction =
  | 'highlight'
  | 'underline'
  | 'box'
  | 'circle'
  | 'strike-through'
  | 'crossed-off'
  | 'bracket'

interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
}

export function Highlighter({
  children,
  action = 'highlight',
  color = '#ffd1dc',
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: '-10%',
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useLayoutEffect(() => {
    const element = elementRef.current
    let annotation: RoughAnnotation | null = null
    let resizeObserver: ResizeObserver | null = null
    let redrawTimer: ReturnType<typeof setTimeout> | null = null
    let settleTimer: ReturnType<typeof setTimeout> | null = null

    if (shouldShow && element) {
      const annotationConfig = {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
      }

      const currentAnnotation = annotate(element, annotationConfig)
      annotation = currentAnnotation
      currentAnnotation.show()

      // Defer resize watches until emerge/layout settle — mid-animation
      // hide→show redraws stack strokes and smear the highlight.
      const settleMs = Math.max(animationDuration + 80, 620)
      settleTimer = setTimeout(() => {
        resizeObserver = new ResizeObserver(() => {
          if (redrawTimer) clearTimeout(redrawTimer)
          redrawTimer = setTimeout(() => {
            currentAnnotation.hide()
            currentAnnotation.show()
          }, 50)
        })
        resizeObserver.observe(element)
      }, settleMs)
    }

    return () => {
      if (settleTimer) clearTimeout(settleTimer)
      if (redrawTimer) clearTimeout(redrawTimer)
      annotation?.remove()
      resizeObserver?.disconnect()
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ])

  // `inline` (not inline-block): getClientRects() hugs each line of text
  // instead of stretching to the heading's full content width.
  return (
    <span ref={elementRef} className="relative bg-transparent [box-decoration-break:clone]">
      {children}
    </span>
  )
}

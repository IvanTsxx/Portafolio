'use client'

import type React from 'react'
import { Highlighter } from '@/components/ui/highlighter'

type AnnotationAction =
  | 'highlight'
  | 'underline'
  | 'box'
  | 'circle'
  | 'strike-through'
  | 'crossed-off'
  | 'bracket'

export type HighlightMarkProps = {
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

/** Site-wide Magic UI highlight defaults (signal marker on enter). */
export const HIGHLIGHT_MARK = {
  action: 'highlight',
  color: '#FF4D0099',
  strokeWidth: 1.5,
  animationDuration: 600,
  iterations: 2,
  padding: 1,
  isView: true,
} as const satisfies Omit<HighlightMarkProps, 'children'>

/** Marker stroke wrapper — use inside any heading. */
export function HighlightMark({
  children,
  action = HIGHLIGHT_MARK.action,
  color = HIGHLIGHT_MARK.color,
  strokeWidth = HIGHLIGHT_MARK.strokeWidth,
  animationDuration = HIGHLIGHT_MARK.animationDuration,
  iterations = HIGHLIGHT_MARK.iterations,
  isView = HIGHLIGHT_MARK.isView,
  padding = HIGHLIGHT_MARK.padding,
  multiline,
}: HighlightMarkProps) {
  return (
    <Highlighter
      action={action}
      color={color}
      strokeWidth={strokeWidth}
      animationDuration={animationDuration}
      iterations={iterations}
      isView={isView}
      padding={padding}
      multiline={multiline}
    >
      {children}
    </Highlighter>
  )
}

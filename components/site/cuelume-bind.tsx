// components/site/cuelume-bind.tsx
// One-shot delegated listeners for data-cuelume-* attributes.
'use client'

import * as React from 'react'
import { initCuelume } from '@/lib/cuelume'

export function CuelumeBind() {
  React.useEffect(() => {
    initCuelume()
  }, [])

  return null
}

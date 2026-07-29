// components/site/theme-provider.tsx
// next-themes wrapper — class on <html>, persists to localStorage.
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children,
  scriptProps,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
      // next-themes FOUC script: React 19 warns on <script> in Client Components.
      // Server: text/javascript (runs before paint). Client: text/plain (no re-exec).
      // @see https://nextjs.org/docs/app/guides/preventing-flash-before-hydration
      scriptProps={{
        ...scriptProps,
        type:
          typeof window === 'undefined' ? 'text/javascript' : 'text/plain',
      }}
    >
      {children}
    </NextThemesProvider>
  )
}

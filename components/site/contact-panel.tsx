// components/site/contact-panel.tsx
// Bottom-right: "+" Field button that opens a contact panel.
// Uses @base-ui/react Dialog for accessible overlay behavior.
'use client'

import * as React from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { cn } from '@/lib/utils'
import { Field } from '@/components/primitives/field'
import { Label } from '@/components/primitives/label'
import { Text } from '@/components/primitives/text'
import { Frame } from '@/components/primitives/frame'
import { Stack } from '@/components/primitives/stack'

export function ContactPanel() {
  const [open, setOpen] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Placeholder: in production, wire to an API route
    setSubmitted(true)
  }

  return (
    <>
      {/* Trigger: bottom-right fixed */}
      <div className="fixed bottom-4 right-4 z-[50]">
        <Field
          as="button"
          size="md"
          onClick={() => setOpen(true)}
          aria-label="Open contact panel"
        >
          +
        </Field>
      </div>

      {/* Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          {/* Backdrop */}
          <Dialog.Backdrop
            className={cn(
              'fixed inset-0 z-[80] bg-ax-void/80',
              'transition-opacity duration-[120ms]',
              'data-[open]:opacity-100 data-[closed]:opacity-0'
            )}
          />

          {/* Panel */}
          <Dialog.Popup
            className={cn(
              'fixed bottom-12 right-4 z-[80] w-[min(420px,calc(100vw-2rem))]',
              'focus:outline-none'
            )}
          >
            <Frame
              variant="solid"
              dither
              header={
                <div className="flex items-center justify-between w-full">
                  <Label tone="mid">CONTACT</Label>
                  <Dialog.Close
                    className="inline-flex items-center justify-center border border-ax-line font-mono text-[0.6875rem] uppercase tracking-[0.12em] px-2 py-1 text-ax-mid hover:text-ax-bright hover:border-ax-mid transition-colors duration-[90ms] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ax-signal"
                    aria-label="Close contact panel"
                  >
                    ESC
                  </Dialog.Close>
                </div>
              }
              contentPadding="md"
            >
              {submitted ? (
                <Stack gap={3}>
                  <Label tone="signal" as="p">MESSAGE SENT /</Label>
                  <Text variant="body" size="sm" tone="mid" as="p">
                    I will get back to you via email. Thank you.
                  </Text>
                </Stack>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Stack gap={2}>
                    <Label tone="dim" as="label" htmlFor="contact-email">EMAIL /</Label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="your@email.com"
                      className={cn(
                        'w-full bg-transparent border border-ax-line px-3 py-2',
                        'font-mono text-[0.8125rem] text-ax-bright placeholder:text-ax-dim',
                        'focus:outline-none focus:border-ax-mid',
                        'transition-colors duration-[90ms]'
                      )}
                    />
                  </Stack>

                  <Stack gap={2}>
                    <Label tone="dim" as="label" htmlFor="contact-message">MESSAGE /</Label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      placeholder="What are you building?"
                      className={cn(
                        'w-full bg-transparent border border-ax-line px-3 py-2 resize-none',
                        'font-mono text-[0.8125rem] text-ax-bright placeholder:text-ax-dim',
                        'focus:outline-none focus:border-ax-mid',
                        'transition-colors duration-[90ms]'
                      )}
                      onKeyDown={(e) => {
                        // CJK IME guard — do not submit on composition Enter
                        if (e.nativeEvent.isComposing || e.keyCode === 229) return
                      }}
                    />
                  </Stack>

                  <div className="flex justify-end">
                    <Field as="button" type="submit" size="md">
                      SEND
                    </Field>
                  </div>
                </form>
              )}
            </Frame>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

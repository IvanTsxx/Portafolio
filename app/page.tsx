// app/page.tsx
// Placeholder — Step 3 (Phyllotaxis + Index page) replaces this entirely.
// For now it renders a minimal compile-check with the primitives.
import { Container } from '@/components/primitives/container'
import { Stack } from '@/components/primitives/stack'
import { Heading } from '@/components/primitives/heading'
import { Text } from '@/components/primitives/text'
import { Label } from '@/components/primitives/label'

export default function HomePage() {
  return (
    <div className="pt-24 pb-16">
      <Container size="grid">
        <Stack gap={6}>
          <Label tone="dim" as="p" index="001">
            FRONTEND DEVELOPER
          </Label>

          <Heading level={1} size="2xl" responsive>
            Building at the edge.
          </Heading>

          <Text variant="body" size="base" tone="mid" maxWidth as="p">
            Generative systems, agent tooling, and whatever ships next.
            Next.js, TypeScript, AI SDK.
          </Text>
        </Stack>
      </Container>
    </div>
  )
}

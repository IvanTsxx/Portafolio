import { Markdown } from "@/shared/components/markdown";

import { SectionHeader } from "./section-header";

const ABOUT_CONTENT = `
- Full Stack Developer specialized in Next.js (App Router), focused on building scalable, high-performance applications.
- Strong understanding of rendering strategies (SSR, RSC, PPR, CSR) and caching systems (Next.js + Redis).
- Docs-first approach to problem-solving, with emphasis on framework internals and architecture decisions.
- Open source:
  - Built a MercadoPago plugin for Better Auth (authentication-first payments, subscriptions, webhooks).
  - Created AI-driven Next.js architecture skills for coding agents.
  - Active open-source contributor across the Next.js ecosystem (features, fixes, documentation).
- Experience building real-world systems: e-commerce, internal tools, health-tech, and AI-powered applications.
- Focus on simplicity, performance, and maintainability.
- Preference for minimal, functional interfaces with no visual noise.
`.trim();

export function AboutSection() {
  return (
    <section>
      <SectionHeader label="About" />
      <div className="prose dark:prose-invert">
        <Markdown content={ABOUT_CONTENT} />
      </div>
    </section>
  );
}

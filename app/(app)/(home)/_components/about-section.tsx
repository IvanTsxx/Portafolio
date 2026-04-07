import { Markdown } from "@/shared/components/markdown";

import { SectionHeader } from "./section-header";

const ABOUT_CONTENT = `
- **Specialized in Next.js**, focused on building scalable and high-performance web applications.
- Strong experience in **frontend architecture**, performance optimization, and modern rendering strategies (SSR, RSC, caching, PPR).
- Passionate about turning complex problems into clean, maintainable, and production-ready solutions.
- Experience working on real-world products including e-commerce, landing pages, open source, health-tech, and internal enterprise systems.
- Constantly exploring **AI integrations** and modern full-stack patterns to build smarter products.
`.trim();

export function AboutSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader label="About" />
      <div className="prose dark:prose-invert">
        <Markdown content={ABOUT_CONTENT} />
      </div>
    </section>
  );
}

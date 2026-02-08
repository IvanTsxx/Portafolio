import {
  ArrowRight,
  Briefcase,
  Calendar,
  Code2,
  ExternalLink,
  Github,
  Rocket,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getExperiences } from "@/app/actions/experiences";
import { getProjects } from "@/app/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { socials } from "@/lib/constants";

const skills = {
  frontend: ["Next.js", "React", "Angular", "Astro", "TypeScript"],
  backend: ["Node.js", "NestJS", "Express", "ElysiaJS", ".NET"],
  databases: ["PostgreSQL", "Redis", "Prisma", "Drizzle"],
  ai: ["Vercel AI SDK", "OpenRouter", "AI Elements"],
  cloud: ["Vercel", "Neon", "Tigris S3"],
  tools: ["shadcn/ui", "Tailwind CSS", "Better Auth", "MercadoPago", "Zod"],
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [projects, experiences] = await Promise.all([
    getProjects(true).then((p) => p.slice(0, 4)),
    getExperiences().then((e) => e.slice(0, 4)),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 py-24 lg:px-8">
        <div className="space-y-8">
          <div className="animate-fade-in animate-initial">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-medium text-primary text-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Disponible para proyectos
            </span>
          </div>

          <div className="animate-initial animate-slide-up space-y-4 delay-100">
            <h1 className="font-bold text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
              Iván Bongiovanni
            </h1>
            <p className="max-w-xl text-muted-foreground text-xl lg:text-2xl">
              Full‑Stack Developer especializado en{" "}
              <span className="font-medium text-foreground">Next.js</span> y{" "}
              <span className="font-medium text-foreground">React</span>
            </p>
          </div>

          <p className="max-w-2xl animate-initial animate-slide-up text-lg text-muted-foreground leading-relaxed delay-200">
            Construyo aplicaciones web rápidas, escalables y orientadas al
            negocio. Foco en performance, SEO y experiencia de usuario.
          </p>

          <div className="flex animate-initial animate-slide-up flex-col gap-3 delay-300 sm:flex-row">
            <Button
              size="lg"
              render={
                <Link href="#projects">
                  Ver proyectos
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              }
            />

            <Button
              size="lg"
              variant="outline"
              render={
                <a href="/cv.pdf" download>
                  Descargar CV
                </a>
              }
            />
          </div>
          <div className="flex animate-initial animate-slide-up flex-col gap-3 delay-300 sm:flex-row">
            {socials.map((social) => (
              <Button
                key={social.name}
                size="lg"
                variant="outline"
                render={
                  <Link target="_blank" href={social.href}>
                    <social.icon className="size-6" />
                  </Link>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Experience Timeline - Horizontal */}
      <section id="experience" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-2xl text-foreground tracking-tight lg:text-3xl">
                Experiencia
              </h2>
              <p className="mt-1 text-muted-foreground">
                Trayectoria profesional reciente
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={
                <Link href="/experience">
                  Ver toda
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              }
            />
          </div>

          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-8 right-0 left-0 h-px bg-border" />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className="relative animate-initial animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute top-6 left-0 flex size-4 items-center justify-center">
                    <div className="size-3 rounded-full border-2 border-primary bg-background" />
                  </div>

                  <div className="ml-8 pt-10">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Calendar className="size-3" />
                      <span>
                        {formatDate(exp.startDate)} —{" "}
                        {exp.endDate ? formatDate(exp.endDate) : "Presente"}
                      </span>
                    </div>

                    <h3 className="mt-2 font-medium text-foreground">
                      {exp.position}
                    </h3>

                    <p className="mt-1 flex items-center gap-1 text-muted-foreground text-sm">
                      <Briefcase className="size-3" />
                      {exp.company}
                    </p>

                    {exp.description && (
                      <p className="mt-3 line-clamp-2 text-muted-foreground text-sm">
                        {exp.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {exp.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech.id}
                          className="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground text-xs"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {experiences.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                Próximamente agregaré mi experiencia laboral.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="bg-muted/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-2xl text-foreground tracking-tight lg:text-3xl">
                Proyectos
              </h2>
              <p className="mt-1 text-muted-foreground">
                Soluciones reales con tecnologías modernas
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={
                <Link href="/projects">
                  Ver todos
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              }
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group relative flex animate-initial animate-slide-up flex-col overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-lg transition-colors group-hover:text-primary">
                      {project.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {project.demoUrl && (
                      <span className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                        <ExternalLink className="size-4" />
                      </span>
                    )}
                    {project.githubUrl && (
                      <span className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                        <Github className="size-4" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <Badge
                      key={tech.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {tech.name}
                    </Badge>
                  ))}
                  {project.technologies.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.technologies.length - 5}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {projects.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              Próximamente agregaré proyectos destacados.
            </p>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-semibold text-2xl text-foreground tracking-tight lg:text-3xl">
              Stack tecnológico
            </h2>
            <p className="mt-2 text-muted-foreground">
              Herramientas que domino para crear soluciones completas
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <h3 className="font-medium text-foreground text-sm">
                  Frontend
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.frontend.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/50 bg-card px-3 py-1 text-muted-foreground text-sm transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <h3 className="font-medium text-foreground text-sm">Backend</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.backend.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/50 bg-card px-3 py-1 text-muted-foreground text-sm transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <h3 className="font-medium text-foreground text-sm">
                  Databases
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.databases.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/50 bg-card px-3 py-1 text-muted-foreground text-sm transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="font-medium text-foreground text-sm">
                  IA & LLMs
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.ai.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/50 bg-card px-3 py-1 text-muted-foreground text-sm transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Rocket className="size-4 text-primary" />
                <h3 className="font-medium text-foreground text-sm">
                  Cloud & Infra
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.cloud.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/50 bg-card px-3 py-1 text-muted-foreground text-sm transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <h3 className="font-medium text-foreground text-sm">
                  Herramientas
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.tools.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/50 bg-card px-3 py-1 text-muted-foreground text-sm transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Minimal at the end */}
      <section
        id="about"
        className="border-border/50 border-t bg-muted/20 py-16 lg:py-20"
      >
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="space-y-6 text-center">
            <h2 className="font-semibold text-2xl text-foreground tracking-tight lg:text-3xl">
              Sobre mí
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Soy{" "}
                <span className="font-medium text-foreground">
                  Iván Bongiovanni
                </span>
                , Full‑stack Developer con foco en{" "}
                <span className="font-medium text-foreground">
                  Next.js (App Router)
                </span>{" "}
                y <span className="font-medium text-foreground">React</span>.
              </p>
              <p>
                Trabajo con{" "}
                <span className="font-medium text-foreground">
                  SSR, SSG, ISR y PPR
                </span>
                , eligiendo estratégicamente el tipo de renderizado para
                maximizar performance, SEO y UX.
              </p>
              <p>
                Diseño arquitecturas limpias aplicando patrones como{" "}
                <span className="font-medium text-foreground">
                  Screaming Architecture, BFF y DAL
                </span>
                . Integro IA generativa, pagos, emails transaccionales y storage
                escalable.
              </p>
            </div>

            <div className="pt-6">
              <Button
                size="lg"
                render={
                  <a href="mailto:ivanjara2208@gmail.com">
                    Contactarme
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import {
  ArrowRight,
  Code2,
  ExternalLink,
  Github,
  Rocket,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getExperiences } from "@/app/actions/experiences";
import { getProjects } from "@/app/actions/projects";
import { AboutBento } from "@/components/about-bento";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { TechOrbit } from "@/components/tech-orbit";
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

// formatDate moved to experience-timeline.tsx

export default async function HomePage() {
  const [projects, experiences] = await Promise.all([
    getProjects(true).then((p) => p.slice(0, 4)),
    getExperiences().then((e) => e.slice(0, 4)),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section - Apple-inspired minimal */}
      <section className="mx-auto max-w-5xl px-4 py-32 lg:px-8 lg:py-40">
        <div className="space-y-10">
          <div className="animate-fade-in animate-initial">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1.5 font-medium text-primary/90 text-xs tracking-wide">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Disponible para proyectos
            </span>
          </div>

          <div className="animate-initial animate-slide-up space-y-5 delay-100">
            <h1 className="font-semibold text-5xl text-foreground tracking-tight sm:text-6xl lg:text-7xl">
              Iván Bongiovanni
            </h1>
            <p className="max-w-2xl text-muted-foreground text-xl leading-relaxed lg:text-2xl">
              Full‑Stack Developer especializado en{" "}
              <span className="font-medium text-foreground">Next.js</span> y{" "}
              <span className="font-medium text-foreground">React</span>
            </p>
          </div>

          <p className="max-w-2xl animate-initial animate-slide-up text-lg text-muted-foreground/90 leading-relaxed delay-200">
            Construyo aplicaciones web rápidas, escalables y orientadas al
            negocio. Foco en performance, SEO y experiencia de usuario.
          </p>

          <div className="flex animate-initial animate-slide-up flex-col gap-4 pt-2 delay-300 sm:flex-row sm:items-center">
            <Button
              size="lg"
              sound={true}
              className="rounded-xl px-6"
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
              className="rounded-xl px-6"
              render={
                <a href="/CV.pdf" download>
                  Descargar CV
                </a>
              }
            />
          </div>

          <div className="flex animate-initial animate-slide-up flex-row items-center gap-2 pt-2 delay-400">
            {socials.map((social) => (
              <Button
                key={social.name}
                size="icon"
                variant="ghost"
                className="rounded-xl text-muted-foreground transition-colors hover:text-foreground"
                render={
                  <Link target="_blank" href={social.href}>
                    <social.icon className="size-5" />
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

          <ExperienceTimeline experiences={experiences} />
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="bg-muted/20 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-14 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-2xl text-foreground tracking-tight lg:text-3xl">
                Proyectos
              </h2>
              <p className="mt-2 text-muted-foreground">
                Soluciones reales con tecnologías modernas
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-muted-foreground hover:text-foreground"
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
                className="group relative flex animate-initial animate-slide-up flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Cover Image */}
                {project.coverImage && (
                  <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground text-lg transition-colors group-hover:text-primary">
                        {project.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {project.demoUrl && (
                        <span className="flex size-9 items-center justify-center rounded-xl border border-border/40 bg-background/80 text-muted-foreground transition-all group-hover:border-primary/20 group-hover:text-primary">
                          <ExternalLink className="size-4" />
                        </span>
                      )}
                      {project.githubUrl && (
                        <span className="flex size-9 items-center justify-center rounded-xl border border-border/40 bg-background/80 text-muted-foreground transition-all group-hover:border-primary/20 group-hover:text-primary">
                          <Github className="size-4" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <Badge
                        key={tech.id}
                        variant="secondary"
                        className="rounded-lg text-xs"
                      >
                        {tech.name}
                      </Badge>
                    ))}
                    {project.technologies.length > 5 && (
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        +{project.technologies.length - 5}
                      </Badge>
                    )}
                  </div>
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
      {/* Tech Stack - Orbit Style */}
      <section id="skills" className="overflow-hidden py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <TechOrbit />
        </div>
      </section>

      {/* About Section - Bento Grid */}
      <AboutBento />
    </main>
  );
}

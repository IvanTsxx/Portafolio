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
import { getPosts } from "@/app/actions/posts";
import { getProjects } from "@/app/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const skills = {
  frontend: ["Next.js (App Router)", "React", "Angular", "Astro"],
  backend: ["Node.js", "NestJS", "Express", "ElysiaJS", "PHP", ".NET 9"],
  databases: ["PostgreSQL", "Redis", "Prisma", "Drizzle ORM"],
  ai: [
    "Vercel AI SDK (v6)",
    "AI Elements",
    "StreamText / GenerateText / GenerateObject",
    "OpenRouter",
  ],
  cloud: ["Vercel", "Neon", "Tigris S3"],
  testing: ["Vitest", "Playwright"],
  tools: [
    "shadcn/ui",
    "Tailwind CSS",
    "Better Auth",
    "MercadoPago",
    "TanStack Query",
    "Zod",
    "BiomeJS",
  ],
};

export default async function HomePage() {
  const [projects, posts, experiences] = await Promise.all([
    getProjects(true).then((p) => p.slice(0, 3)),
    getPosts(true).then((p) => p.slice(0, 3)),
    getExperiences().then((e) => e.slice(0, 2)),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm shadow-lg shadow-primary/50">
            <Sparkles className="size-4" />
            Disponible para nuevos proyectos
          </div>

          <h1 className="text-balance font-bold text-4xl text-foreground tracking-tight drop-shadow-[0_0_30px_rgba(74,222,128,0.3)] sm:text-6xl lg:text-7xl">
            Iván Bongiovanni
          </h1>

          <p className="mx-auto max-w-2xl text-balance text-muted-foreground text-xl lg:text-2xl">
            Full‑Stack Developer especializado en{" "}
            <span className="font-semibold text-primary drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
              Next.js
            </span>{" "}
            y{" "}
            <span className="font-semibold text-primary drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
              React
            </span>
          </p>

          <p className="mx-auto max-w-3xl text-balance text-lg text-muted-foreground leading-relaxed">
            Construyo aplicaciones web rápidas, escalables y orientadas al
            negocio, con foco en performance, SEO y experiencia de usuario.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button
              size="lg"
              className="shadow-lg shadow-primary/50"
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
              className="border-primary/30 bg-transparent hover:bg-primary/10"
              render={
                <a href="/cv.pdf" download>
                  Descargar CV
                </a>
              }
            />
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* About Section */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="font-bold text-3xl text-foreground tracking-tight lg:text-4xl">
              Quién soy
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Soy{" "}
                <span className="font-semibold text-foreground">
                  Iván Bongiovanni
                </span>
                , Full‑stack Developer con foco en{" "}
                <span className="font-semibold text-foreground">
                  Next.js (App Router)
                </span>{" "}
                y <span className="font-semibold text-foreground">React</span>,
                especializado en construir aplicaciones web{" "}
                <span className="font-semibold text-foreground">
                  rápidas, escalables y orientadas al negocio
                </span>
                .
              </p>
              <p>
                Trabajo con{" "}
                <span className="font-semibold text-foreground">
                  SSR, SSG, ISR y PPR
                </span>
                , eligiendo estratégicamente el tipo de renderizado según el
                contenido para{" "}
                <span className="font-semibold text-foreground">
                  maximizar performance, SEO y experiencia de usuario
                </span>
                .
              </p>
              <p>
                Diseño{" "}
                <span className="font-semibold text-foreground">
                  arquitecturas limpias y mantenibles
                </span>
                , aplicando patrones como{" "}
                <span className="font-semibold text-foreground">
                  Screaming Architecture, BFF y DAL
                </span>
                . Desarrollo flujos completos de{" "}
                <span className="font-semibold text-foreground">
                  autenticación y autorización
                </span>
                , integro{" "}
                <span className="font-semibold text-foreground">
                  IA generativa
                </span>
                , <span className="font-semibold text-foreground">pagos</span>,{" "}
                <span className="font-semibold text-foreground">
                  emails transaccionales
                </span>{" "}
                y{" "}
                <span className="font-semibold text-foreground">
                  storage escalable
                </span>
                , siempre con un enfoque claro:{" "}
                <span className="font-semibold text-foreground">
                  entregar productos sólidos, mantenibles y listos para crecer
                </span>
                .
              </p>
            </div>
          </div>

          <Card className="border-primary/30 bg-linear-to-br from-primary/5 to-accent/5 shadow-2xl shadow-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                <Rocket className="size-6 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                Qué aporto a tu equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-lg text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary shadow-lg shadow-primary/50">
                    ✓
                  </span>
                  <span>
                    Desarrollo de{" "}
                    <span className="font-semibold text-primary">
                      aplicaciones web modernas
                    </span>{" "}
                    con foco en performance y SEO
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary shadow-lg shadow-primary/50">
                    ✓
                  </span>
                  <span>
                    Arquitecturas escalables pensadas para crecimiento real
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary shadow-lg shadow-primary/50">
                    ✓
                  </span>
                  <span>
                    Integración de{" "}
                    <span className="font-semibold text-primary">
                      IA aplicada al producto
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary shadow-lg shadow-primary/50">
                    ✓
                  </span>
                  <span>
                    Alto estándar de{" "}
                    <span className="font-semibold text-primary">
                      calidad, tipado estricto y mantenibilidad
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary shadow-lg shadow-primary/50">
                    ✓
                  </span>
                  <span>
                    Mentalidad de producto: pienso en usuarios y escalabilidad
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary shadow-lg shadow-primary/50">
                    ✓
                  </span>
                  <span>
                    Mejora continua: mejoro constantemente mis habilidades y
                    conocimientos
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl opacity-30" />

      {/* Featured Projects Section */}
      <section id="projects" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="font-bold text-3xl text-foreground tracking-tight lg:text-4xl">
                Proyectos destacados
              </h2>
              <p className="text-lg text-muted-foreground">
                Soluciones reales construidas con tecnologías modernas
              </p>
            </div>
            <Button
              variant="outline"
              className="border-primary/30 bg-transparent hover:bg-primary/10"
              render={
                <Link href="/projects">
                  Ver todos
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              }
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group relative flex flex-col overflow-hidden border-primary/20 bg-card shadow-primary/20 shadow-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/30"
              >
                {project.image && (
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="size-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent opacity-60" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-foreground transition-colors group-hover:text-primary">
                    <Link href={`/projects/${project.slug}`}>
                      {project.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <Badge
                        key={tech.id}
                        variant="secondary"
                        className="bg-primary/10 text-primary text-xs"
                      >
                        {tech.name}
                      </Badge>
                    ))}
                    {project.technologies.length > 4 && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary text-xs"
                      >
                        +{project.technologies.length - 4}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {project.demoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/30 bg-transparent hover:bg-primary/10"
                        render={
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 size-4" />
                            Demo
                          </a>
                        }
                      />
                    )}
                    {project.githubUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/30 bg-transparent hover:bg-primary/10"
                        render={
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="mr-2 size-4" />
                            Código
                          </a>
                        }
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <Card className="border-primary/20 bg-card shadow-lg shadow-primary/10">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground text-xl">
                  Próximamente agregaré proyectos destacados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl opacity-30" />

      {/* Experience Section */}
      <section id="experience" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="font-bold text-3xl text-foreground tracking-tight lg:text-4xl">
                Experiencia reciente
              </h2>
              <p className="text-lg text-muted-foreground">
                Donde he trabajado y qué he construido
              </p>
            </div>
            <Button
              variant="outline"
              className="border-primary/30 bg-transparent hover:bg-primary/10"
              render={
                <Link href="/experience">
                  Ver toda
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              }
            />
          </div>

          <div className="space-y-6">
            {experiences.map((exp) => (
              <Card
                key={exp.id}
                className="border-primary/20 bg-card shadow-primary/20 shadow-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-primary text-xl">
                        {exp.position}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-base">
                        <Briefcase className="size-4" />
                        {exp.company}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="size-4" />
                      <span>
                        {new Date(exp.startDate).toLocaleDateString("es-ES", {
                          month: "short",
                          year: "numeric",
                        })}
                        {" - "}
                        {exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString("es-ES", {
                              month: "short",
                              year: "numeric",
                            })
                          : "Presente"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-muted-foreground">
                    {exp.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {exp.technologies.slice(0, 6).map((tech) => (
                      <Badge
                        key={tech.id}
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {experiences.length === 0 && (
            <Card className="border-primary/20 bg-card shadow-lg shadow-primary/10">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground text-xl">
                  Próximamente agregaré mi experiencia laboral.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl opacity-30" />

      {/* Skills Section */}
      <section id="skills" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="font-bold text-3xl text-foreground tracking-tight lg:text-4xl">
              Stack tecnológico
            </h2>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              Herramientas y tecnologías que domino para crear soluciones
              completas
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20 bg-card shadow-primary/20 shadow-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Code2 className="size-5" />
                  Frontend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.frontend.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card shadow-primary/20 shadow-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Code2 className="size-5" />
                  Backend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.backend.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card shadow-primary/20 shadow-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="size-5" />
                  IA & LLMs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.databases.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md hover:shadow-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  IA & LLMs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.ai.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card shadow-primary/20 shadow-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Code2 className="size-5" />
                  Cloud & Infra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.cloud.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card shadow-primary/20 shadow-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Code2 className="size-5" />
                  Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.testing.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md hover:shadow-primary/5 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="size-5 text-primary" />
                  Herramientas & Ecosistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <Card className="border-primary/40 bg-linear-to-br from-primary/10 to-accent/10 shadow-2xl shadow-primary/40">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-foreground lg:text-4xl">
              ¿Buscás un developer que entregue valor desde el día uno?
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Hablemos sobre cómo puedo ayudar a tu equipo o proyecto
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="shadow-lg shadow-primary/50"
              render={
                <a href="mailto:ivanjara2208@gmail.com">
                  Contactarme
                  <ArrowRight className="ml-2 size-4" />
                </a>
              }
            />

            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 bg-transparent hover:bg-primary/10"
              render={<Link href="/blog">Leer mi blog</Link>}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

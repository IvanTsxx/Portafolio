import "dotenv/config";
import { generateSlug } from "@/lib/utils";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Crear tecnologías
  const technologies = [
    "Next.js",
    "React",
    "TypeScript",
    "Angular",
    "Ionic",
    "Node.js",
    "NestJS",
    "Express",
    "ElysiaJS",
    ".NET",
    "PostgreSQL",
    "Redis",
    "Prisma",
    "Drizzle ORM",
    "Vercel AI SDK",
    "AI Elements",
    "OpenRouter",
    "Vercel",
    "Neon",
    "Tigris S3",
    "Vitest",
    "Playwright",
    "shadcn/ui",
    "Tailwind CSS",
    "Better Auth",
    "MercadoPago",
    "TanStack Form",
    "Zod",
    "BiomeJS",
    "Framer Motion",
    "RxJS",
    "Capacitor",
    "Redux",
    "Zustand",
    "PrimeReact",
  ];

  const techMap: Record<string, string> = {};

  for (const techName of technologies) {
    const tech = await prisma.technology.upsert({
      where: { name: techName },
      update: {},
      create: { name: techName, slug: generateSlug(techName) },
    });
    techMap[techName] = tech.id;
  }

  console.log(`✅ Created ${technologies.length} technologies`);

  // Crear experiencias laborales
  const experiences = [
    {
      company: "Aliva Shop",
      position: "Frontend Developer",
      slug: "aliva-shop",
      description:
        "Lideré la migración completa de Angular 15 → 20 e Ionic 5 → 8. Implementé features modernas de Angular 20: signals, httpResource, input/output.",
      content: `## Responsabilidades

- Lideré la **migración completa de Angular 15 → 20** e **Ionic 5 → 8**
- Implementé features modernas de Angular 20: **signals, httpResource, input/output**
- Integré **geolocalización, push notifications y soporte offline/online**
- Refactoricé la arquitectura para mejorar **escalabilidad y mantenibilidad**`,
      startDate: new Date("2025-06-01"),
      endDate: null,
      current: true,
      location: "Remoto",
      technologies: [
        "Angular",
        "Ionic",
        "TypeScript",
        "RxJS",
        "Capacitor",
        "BiomeJS",
      ],
    },
    {
      company: "Tensolite",
      position: "Full-Stack Developer",
      slug: "tensolite",
      description:
        "Desarrollo de funcionalidades para productos internos y clientes. Carga masiva de datos desde Excel a CRM.",
      content: `## Responsabilidades

- Desarrollo de funcionalidades para productos internos y clientes
- Carga masiva de datos desde Excel a CRM
- Generación automática de PDFs
- Manejo de estado con **Redux y Zustand**
- Implementación de uploads y sharing dinámico
- Maquetación fiel desde Figma`,
      startDate: new Date("2023-07-01"),
      endDate: new Date("2023-11-30"),
      current: false,
      location: "Argentina",
      technologies: ["React", "TypeScript", "Node.js", "Redux", "Zustand"],
    },
    {
      company: "Doctor Qali",
      position: "Frontend Developer",
      slug: "doctor-qali",
      description:
        "Refactor de interfaces en React + TypeScript. Mejora de performance y UX.",
      content: `## Responsabilidades

- Refactor de interfaces en React + TypeScript
- Mejora de performance y UX
- Desarrollo de nuevas funcionalidades
- Uso de PrimeReact para acelerar UI`,
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-06-30"),
      current: false,
      location: "Argentina",
      technologies: ["React", "TypeScript", "PrimeReact"],
    },
  ];

  for (const exp of experiences) {
    const techIds = exp.technologies
      .map((name) => techMap[name])
      .filter(Boolean);

    await prisma.experience.upsert({
      where: { slug: exp.slug },
      update: {
        ...exp,
        technologies: { set: [] },
      },
      create: {
        company: exp.company,
        position: exp.position,
        slug: exp.slug,
        description: exp.description,
        content: exp.content,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current,
        location: exp.location,
        technologies: {
          connect: techIds.map((id) => ({ id })),
        },
      },
    });

    // Connect technologies in update case
    await prisma.experience.update({
      where: { slug: exp.slug },
      data: {
        technologies: {
          connect: techIds.map((id) => ({ id })),
        },
      },
    });
  }

  console.log(`✅ Created ${experiences.length} experiences`);

  // Crear proyectos
  const projects = [
    {
      title: "Pikuu",
      slug: "pikuu",
      description:
        "Asistente técnico para desarrolladores que genera backend y UI productiva a partir de una idea o esquema de datos.",
      content: `## Qué resuelve

- Generación y consumo de \`schema.prisma\`
- Schemas de validación con **Zod**
- **Server Actions o Route Handlers** (sin mezclas incorrectas)
- Formularios reales con **shadcn/ui + TanStack Form**
- Estado persistente del proyecto
- Iteración controlada por partes
- Streaming de resultados como artifacts

Pikuu **no es un generador genérico**: cada interacción modifica **solo la parte solicitada del proyecto**, manteniendo el estado completo del sistema.`,
      demoUrl: null,
      githubUrl: null,
      published: true,
      featured: true,
      technologies: [
        "Next.js",
        "TypeScript",
        "Prisma",
        "PostgreSQL",
        "Zod",
        "shadcn/ui",
        "TanStack Form",
        "Vercel AI SDK",
        "AI Elements",
        "Framer Motion",
        "BiomeJS",
        "Better Auth",
      ],
    },
    {
      title: "Lules Market",
      slug: "lules-market",
      description:
        "Plataforma web para comercios locales con sistema de suscripciones. Los negocios publican productos y servicios.",
      content: `## Características

Plataforma que permite a comercios locales publicar productos y servicios, mientras que los clientes pueden explorar y contactar directamente con los negocios.

### Funcionalidades
- Sistema de suscripciones con MercadoPago
- Panel de administración para comercios
- Búsqueda y filtros avanzados
- Gestión de productos con imágenes`,
      demoUrl: "https://lulesmarket.vercel.app",
      githubUrl: "https://github.com/IvanTsxx/lules-market",
      published: true,
      featured: true,
      technologies: [
        "Next.js",
        "TypeScript",
        "Drizzle ORM",
        "PostgreSQL",
        "Zod",
        "shadcn/ui",
        "TanStack Form",
        "MercadoPago",
        "ElysiaJS",
        "Tigris S3",
        "Vercel",
        "BiomeJS",
      ],
    },
    {
      title: "Tube AI",
      slug: "tube-ai",
      description:
        "Aplicación web con IA que genera líneas de tiempo y un chat contextual sobre cualquier video de YouTube.",
      content: `## Funcionalidades

- Generación de líneas de tiempo automáticas
- Chat contextual sobre el contenido del video
- Mejora la comprensión y navegación del contenido
- Transcripción inteligente`,
      demoUrl: null,
      githubUrl: "https://github.com/IvanTsxx/tube-ia",
      published: true,
      featured: false,
      technologies: [
        "Next.js",
        "TypeScript",
        "Zod",
        "shadcn/ui",
        "Vercel AI SDK",
        "Prisma",
        "PostgreSQL",
      ],
    },
    {
      title: "AI CV Recommendation",
      slug: "ai-cv-recommendation",
      description:
        "Herramienta que utiliza IA para generar 10 recomendaciones personalizadas para mejorar un CV según una oferta laboral.",
      content: `## Cómo funciona

1. Sube tu CV en formato PDF
2. Pega la descripción del trabajo
3. Recibe 10 recomendaciones personalizadas
4. Mejora tu CV para aumentar tus chances`,
      demoUrl: "https://ai-cv-recomendations.vercel.app",
      githubUrl: "https://github.com/IvanTsxx/ai-cv-recomendations",
      published: true,
      featured: false,
      technologies: [
        "Next.js",
        "TypeScript",
        "Zod",
        "Tailwind CSS",
        "Vercel AI SDK",
      ],
    },
    {
      title: "Better Auth + MercadoPago Plugin",
      slug: "better-auth-mercadopago",
      description:
        "Plugin que integra pagos, suscripciones y webhooks de MercadoPago dentro del ecosistema Better Auth.",
      content: `## Características

- Integración completa con Better Auth
- API type-safe
- Manejo de webhooks
- Soporte para suscripciones
- Fácil configuración`,
      demoUrl: "https://www.npmjs.com/package/better-auth-mercadopago",
      githubUrl: "https://github.com/IvanTsxx/better-auth-mercadopago",
      published: true,
      featured: true,
      technologies: [
        "TypeScript",
        "Better Auth",
        "MercadoPago",
        "Zod",
        "BiomeJS",
      ],
    },
    {
      title: "MemesDev",
      slug: "memesdev",
      description:
        "Plataforma open-source para que desarrolladores compartan y descubran memes de programación.",
      content: `## Funcionalidades

- Sistema de autenticación con Magic Link y Social Auth
- Subida de imágenes
- Sistema de votación
- Comentarios
- Perfil de usuario`,
      demoUrl: "https://memes-dev.vercel.app",
      githubUrl: "https://github.com/IvanTsxx/MemesDev",
      published: true,
      featured: false,
      technologies: [
        "Next.js",
        "TypeScript",
        "Prisma",
        "PostgreSQL",
        "Zod",
        "shadcn/ui",
        "TanStack Form",
        "Better Auth",
        "BiomeJS",
      ],
    },
  ];

  for (const project of projects) {
    const techIds = project.technologies
      .map((name) => techMap[name])
      .filter(Boolean);

    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        title: project.title,
        description: project.description,
        content: project.content,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        published: project.published,
        featured: project.featured,
        technologies: { set: [] },
      },
      create: {
        title: project.title,
        slug: project.slug,
        description: project.description,
        content: project.content,
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        published: project.published,
        featured: project.featured,
        technologies: {
          connect: techIds.map((id) => ({ id })),
        },
      },
    });

    // Connect technologies in update case
    await prisma.project.update({
      where: { slug: project.slug },
      data: {
        technologies: {
          connect: techIds.map((id) => ({ id })),
        },
      },
    });
  }

  console.log(`✅ Created ${projects.length} projects`);

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

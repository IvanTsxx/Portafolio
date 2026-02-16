"use client";

import { cn } from "@/lib/cn";

interface TechOrbitProps {
  technologies: string[];
  className?: string;
}

const TECH_ICONS: Record<string, string> = {
  "Next.js": "https://cdn.simpleicons.org/nextdotjs",
  React: "https://cdn.simpleicons.org/react",
  TypeScript: "https://cdn.simpleicons.org/typescript",
  "Node.js": "https://cdn.simpleicons.org/nodedotjs",
  NestJS: "https://cdn.simpleicons.org/nestjs",
  ElysiaJS: "https://cdn.simpleicons.org/elysia",
  PostgreSQL: "https://cdn.simpleicons.org/postgresql",
  Redis: "https://cdn.simpleicons.org/redis",
  Prisma: "https://cdn.simpleicons.org/prisma",
  "Drizzle ORM": "https://cdn.simpleicons.org/drizzle",
  "Tailwind CSS": "https://cdn.simpleicons.org/tailwindcss",
  "shadcn/ui": "https://cdn.simpleicons.org/shadcnui",
  Angular: "https://cdn.simpleicons.org/angular",
  Astro: "https://cdn.simpleicons.org/astro",
  "Vercel AI SDK": "https://cdn.simpleicons.org/vercel",
  "Better Auth": "https://cdn.simpleicons.org/auth0",
  Vitest: "https://cdn.simpleicons.org/vitest",
  Playwright: "https://cdn.simpleicons.org/playwright",
  Docker: "https://cdn.simpleicons.org/docker",
  Git: "https://cdn.simpleicons.org/git",
  GitHub: "https://cdn.simpleicons.org/github",
  Vercel: "https://cdn.simpleicons.org/vercel",
  BiomeJS: "https://cdn.simpleicons.org/biome",
  Zod: "https://cdn.simpleicons.org/zod",
  Express: "https://cdn.simpleicons.org/express",
};

const WORD_SEPARATOR = /[\s/.]+/;

function getInitials(name: string): string {
  return name
    .split(WORD_SEPARATOR)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TechOrbit({ technologies, className }: TechOrbitProps) {
  const rings = distributeToRings(technologies);

  return (
    <div
      className={cn(
        "not-prose relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center",
        className
      )}
    >
      {/* Center label */}
      <div className="absolute z-10 flex flex-col items-center gap-1 text-center">
        <span className="font-bold text-3xl text-fd-foreground tracking-tight sm:text-4xl">
          Stack
        </span>
        <span className="text-fd-muted-foreground text-sm">
          Tecnologías que domino
        </span>
      </div>

      {/* Rings */}
      {rings.map((ring, ringIndex) => {
        const size = `${(ringIndex + 1) * 30 + 20}%`;
        return (
          <div
            className="not-prose absolute rounded-full border border-fd-border/50"
            key={`ring-${ringIndex.toString()}`}
            style={{ width: size, height: size }}
          >
            {ring.map((tech, techIndex) => {
              const angle = (360 / ring.length) * techIndex - 90;
              const rad = (angle * Math.PI) / 180;
              const x = 50 + 50 * Math.cos(rad);
              const y = 50 + 50 * Math.sin(rad);
              const icon = TECH_ICONS[tech];

              return (
                <div
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  key={tech}
                  style={{
                    left: `${x.toFixed(1)}%`,
                    top: `${y.toFixed(1)}%`,
                    animation: `float ${3 + ringIndex * 0.5 + techIndex * 0.3}s ease-in-out infinite`,
                    animationDelay: `${techIndex * 0.4}s`,
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-fd-border bg-fd-card shadow-sm transition-all duration-300 group-hover:scale-125 group-hover:border-brand/50 group-hover:shadow-brand/10 group-hover:shadow-lg sm:h-11 sm:w-11">
                    {icon ? (
                      <img
                        alt={tech}
                        className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5 dark:brightness-0 dark:invert"
                        height={22}
                        src={icon}
                        width={22}
                      />
                    ) : (
                      <span className="font-bold text-[10px] text-fd-muted-foreground">
                        {getInitials(tech)}
                      </span>
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-fd-foreground px-2 py-1 font-medium text-[10px] text-fd-background opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {tech}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function distributeToRings(items: string[]): string[][] {
  if (items.length <= 4) {
    return [items];
  }
  if (items.length <= 8) {
    return [items.slice(0, 4), items.slice(4)];
  }
  return [items.slice(0, 4), items.slice(4, 9), items.slice(9)];
}

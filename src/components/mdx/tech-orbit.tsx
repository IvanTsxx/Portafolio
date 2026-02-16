"use client";

import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";
import {
  GitIcon,
  NextjsIcon,
  NodejsIcon,
  PostgresqlIcon,
  PrismaIcon,
  ReactIcon,
  TailwindIcon,
  TypescriptIcon,
  VercelIcon,
} from "@/components/icons";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { cn } from "@/lib/cn";

export function TechOrbit() {
  const [hoveredTech, setHoveredTech] = useState<{
    name: string;
    role: string;
  } | null>(null);

  return (
    <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
      {/* Background Particles (Simplified) */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 size-2 animate-pulse rounded-full bg-primary" />
        <div className="absolute top-3/4 right-1/4 size-3 animate-pulse rounded-full bg-secondary delay-700" />
        <div className="absolute top-1/2 left-3/4 size-1 animate-pulse rounded-full bg-foreground delay-300" />
      </div>

      {/* Dynamic Center */}
      <div className="z-10 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {hoveredTech ? (
            <motion.div
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              className="flex flex-col items-center"
              exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              key="tech-info"
              transition={{ duration: 0.3 }}
            >
              <span className="bg-linear-to-b from-foreground to-muted-foreground bg-clip-text font-bold text-5xl text-transparent md:text-7xl">
                {hoveredTech.name}
              </span>
              <span className="mt-2 font-medium text-lg text-primary uppercase tracking-wide">
                {hoveredTech.role}
              </span>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key="default"
              transition={{ duration: 0.3 }}
            >
              <span className="pointer-events-none whitespace-pre-wrap bg-linear-to-b from-black to-gray-300 bg-clip-text text-center font-semibold text-8xl text-transparent leading-none dark:from-white dark:to-black">
                Stack
              </span>
              <span className="pointer-events-none mt-2 text-center font-light text-muted-foreground text-xl">
                Tecnologías que domino
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inner Circles - Core */}
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        delay={20}
        duration={25}
        radius={150}
      >
        <TechIcon
          colorClass="text-[#61DAFB]"
          icon={Icons.react}
          name="React"
          role="Frontend Library"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        delay={10}
        duration={25}
        radius={150}
      >
        <TechIcon
          colorClass="text-zinc-900 dark:text-white"
          icon={Icons.nextjs}
          name="Next.js"
          role="React Framework"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>

      {/* Middle Circles - Languages & Core Tools */}
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        delay={0}
        duration={35}
        radius={200}
        reverse
      >
        <TechIcon
          colorClass="text-[#3178C6]"
          icon={Icons.typescript}
          name="TypeScript"
          role="Type Safety"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        delay={20}
        duration={35}
        radius={200}
        reverse
      >
        <TechIcon
          colorClass="text-[#38B2AC]"
          icon={Icons.tailwind}
          name="Tailwind"
          role="CSS Framework"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        delay={30}
        duration={35}
        radius={200}
        reverse
      >
        <TechIcon
          colorClass="text-[#339933]"
          icon={Icons.node}
          name="Node.js"
          role="JavaScript Runtime"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>

      {/* Outer Circles - Backend & Infra */}
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        delay={10}
        duration={50}
        radius={250}
      >
        <TechIcon
          colorClass="text-[#336791]"
          icon={Icons.postgresql}
          name="PostgreSQL"
          role="Relational DB"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        delay={25}
        duration={50}
        radius={250}
      >
        <TechIcon
          colorClass="text-[#0C344B] dark:text-white"
          icon={Icons.prisma}
          name="Prisma"
          role="ORM"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        delay={15}
        duration={50}
        radius={250}
      >
        <TechIcon
          colorClass="text-zinc-900 dark:text-white"
          icon={Icons.vercel}
          name="Vercel"
          role="Cloud Platform"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>

      {/* Far Outer Circles - Tools */}
      <OrbitingCircles
        className="size-[30px] border-none bg-transparent"
        delay={5}
        duration={60}
        radius={300}
        reverse
      >
        <TechIcon
          colorClass="text-[#F05032]"
          icon={Icons.git}
          name="Git"
          role="Version Control"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
    </div>
  );
}

function TechIcon({
  name,
  role,
  icon,
  colorClass,
  setHover,
}: {
  name: string;
  role: string;
  icon: React.ReactNode;
  colorClass?: string;
  setHover: (tech: { name: string; role: string } | null) => void;
}) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <nowarn>
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: <nowarn>
    <div
      className={cn(
        "group relative flex cursor-pointer items-center justify-center",
        colorClass,
      )}
      onMouseEnter={() => setHover({ name, role })}
      onMouseLeave={() => setHover(null)}
    >
      <div className="transition-all duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_currentColor]">
        {icon}
      </div>
      {/* Background Glow using currentColor */}
      <div className="absolute inset-0 rounded-full bg-current opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30" />
    </div>
  );
}

const Icons = {
  typescript: <TypescriptIcon className="size-6" />,
  react: <ReactIcon className="size-6" />,
  nextjs: <NextjsIcon className="size-6" />,
  tailwind: <TailwindIcon className="size-6" />,
  postgresql: <PostgresqlIcon className="size-6" />,
  prisma: <PrismaIcon className="size-6" />,
  node: <NodejsIcon className="size-6" />,
  vercel: <VercelIcon className="size-6" />,
  git: <GitIcon className="size-6" />,
};

"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useState } from "react";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { cn } from "@/lib/utils";
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
} from "./icons";

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
              key="tech-info"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
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
              key="default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
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
        duration={25}
        delay={20}
        radius={150}
      >
        <TechIcon
          name="React"
          role="Frontend Library"
          icon={Icons.react}
          colorClass="text-[#61DAFB]"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        duration={25}
        delay={10}
        radius={150}
      >
        <TechIcon
          name="Next.js"
          role="React Framework"
          icon={Icons.nextjs}
          colorClass="text-zinc-900 dark:text-white"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>

      {/* Middle Circles - Languages & Core Tools */}
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        radius={200}
        duration={35}
        delay={0}
        reverse
      >
        <TechIcon
          name="TypeScript"
          role="Type Safety"
          icon={Icons.typescript}
          colorClass="text-[#3178C6]"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        radius={200}
        duration={35}
        delay={20}
        reverse
      >
        <TechIcon
          name="Tailwind"
          role="CSS Framework"
          icon={Icons.tailwind}
          colorClass="text-[#38B2AC]"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        radius={200}
        duration={35}
        delay={30}
        reverse
      >
        <TechIcon
          name="Node.js"
          role="JavaScript Runtime"
          icon={Icons.node}
          colorClass="text-[#339933]"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>

      {/* Outer Circles - Backend & Infra */}
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        radius={250}
        duration={50}
        delay={10}
      >
        <TechIcon
          name="PostgreSQL"
          role="Relational DB"
          icon={Icons.postgresql}
          colorClass="text-[#336791]"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        radius={250}
        duration={50}
        delay={25}
      >
        <TechIcon
          name="Prisma"
          role="ORM"
          icon={Icons.prisma}
          colorClass="text-[#0C344B] dark:text-white"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[60px] border-none bg-transparent"
        radius={250}
        duration={50}
        delay={15}
      >
        <TechIcon
          name="Vercel"
          role="Cloud Platform"
          icon={Icons.vercel}
          colorClass="text-zinc-900 dark:text-white"
          setHover={setHoveredTech}
        />
      </OrbitingCircles>

      {/* Far Outer Circles - Tools */}
      <OrbitingCircles
        className="size-[30px] border-none bg-transparent"
        radius={300}
        duration={60}
        reverse
        delay={5}
      >
        <TechIcon
          name="Git"
          role="Version Control"
          icon={Icons.git}
          colorClass="text-[#F05032]"
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

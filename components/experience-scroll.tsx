"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";

interface ExperienceItem {
  id: string;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  company: string;
  position: string;
  description: string | null;
  content: string | null;
  technologies: { id: string; name: string; slug: string }[];
}

interface ExperienceScrollProps {
  experiences: ExperienceItem[];
}

export function ExperienceScroll({ experiences }: ExperienceScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-5xl px-4 md:px-8">
      {/* Central Line - Desktop */}
      <div className="absolute top-0 bottom-0 left-[20px] w-px bg-border/40 md:left-1/2 md:-translate-x-1/2" />

      {/* Animated Line */}
      <motion.div
        style={{ height }}
        className="absolute top-0 left-[20px] w-px origin-top bg-linear-to-b from-primary via-primary/80 to-transparent md:left-1/2 md:-translate-x-1/2"
      />

      {/* Traveling Dot - Follows Scroll */}
      <motion.div
        style={{ top: height }}
        className="absolute left-[20px] z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-[0_0_15px_rgba(var(--primary),0.5)] md:left-1/2"
      >
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
      </motion.div>

      <div className="space-y-12 py-10 md:space-y-24">
        {experiences.map((experience, index) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function ExperienceCard({
  experience,
  index,
}: {
  experience: ExperienceItem;
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`relative flex flex-col gap-8 md:flex-row md:gap-0 ${
        isEven ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Dot removed in favor of traveling dot */}

      {/* Date Side (Empty on Mobile) */}
      <div className="hidden flex-1 items-start justify-end px-12 pt-8 text-right md:flex">
        {!isEven ? <DateBlock experience={experience} align="right" /> : null}
      </div>

      {/* Mobile Date Header */}
      <div className="pt-1 pl-12 md:hidden">
        <span className="mb-2 block font-medium text-primary text-sm uppercase tracking-widest">
          {format(new Date(experience.startDate), "MMM yyyy", { locale: es })} —{" "}
          {experience.current
            ? "Presente"
            : format(new Date(experience.endDate || new Date()), "MMM yyyy", {
                locale: es,
              })}
        </span>
      </div>

      {/* Content Side */}
      <div className="group flex-1 cursor-default pl-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: isEven ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-card/80 hover:shadow-xl md:p-8"
        >
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="font-bold text-foreground text-xl md:text-2xl">
                {experience.position}
              </h3>
            </div>
            <p className="mb-4 font-medium text-lg text-primary">
              {experience.company}
            </p>

            {experience.description && (
              <p className="mb-6 text-base text-muted-foreground leading-relaxed">
                {experience.description}
              </p>
            )}

            {experience.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech) => (
                  <Badge
                    key={tech.id}
                    variant="secondary"
                    className="bg-secondary/40 transition-colors hover:bg-secondary/60"
                  >
                    {tech.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Desktop Date for Even Items */}
        {isEven && (
          <div className="absolute top-8 left-[calc(100%+3rem)] hidden w-full md:block">
            <DateBlock experience={experience} align="left" />
          </div>
        )}
      </div>
    </div>
  );
}

function DateBlock({
  experience,
  align = "left",
}: {
  experience: ExperienceItem;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}
    >
      <span className="font-bold text-5xl text-foreground/5 tabular-nums leading-none md:text-foreground/10">
        {format(new Date(experience.startDate), "yyyy")}
      </span>
      <span className="mt-2 font-medium text-muted-foreground text-sm uppercase tracking-widest">
        {format(new Date(experience.startDate), "MMM", { locale: es })} —{" "}
        {experience.current
          ? "Presente"
          : format(new Date(experience.endDate || new Date()), "MMM yyyy", {
              locale: es,
            })}
      </span>
    </div>
  );
}

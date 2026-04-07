"use client";

import { GraduationCap } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

import { SectionHeader } from "./section-header";

const EDUCATION = [
  {
    degree: "Full Stack Development",
    description:
      "Continuous learning through building real products, open source contributions, and studying modern web architecture patterns.",
    id: "self-taught",
    institution: "Self-taught",
    period: "2021 → present",
  },
  {
    degree: "Computer Science fundamentals",
    description:
      "Algorithms, data structures, systems design. Platzi, Udemy, YouTube.",
    id: "online-courses",
    institution: "Online Courses",
    period: "2021 → 2022",
  },
] as const;

export function EducationSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader label="Education" />
      <div className="flex flex-col">
        {EDUCATION.map((item) => (
          <Accordion key={item.id} className="w-full">
            <AccordionItem
              value={item.id}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <GraduationCap
                    className="h-[14px] w-[14px] shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-[14px] font-semibold text-foreground shrink-0">
                    {item.institution}
                  </span>
                  <span className="text-[14px] text-muted-foreground truncate hidden sm:block">
                    {item.degree}
                  </span>
                  <span className="ml-auto   text-[12px] text-muted-foreground shrink-0 pr-2">
                    {item.period}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="pl-7">
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </section>
  );
}

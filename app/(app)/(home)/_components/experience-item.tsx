// oxlint-disable no-empty-function
"use client";

import Image from "next/image";

import { Markdown } from "@/shared/components/markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { Experience } from "@/shared/config/experiences";

function SkillBadge({ skill }: { skill: string }) {
  return (
    <span className="  text-[11px] border border-border px-2 py-0.5 text-muted-foreground transition-colors hover:border-brand-green hover:text-brand-green cursor-default">
      {skill}
    </span>
  );
}

function CompanyLogo({ src, name }: { src: string; name: string }) {
  return (
    <div className="relative h-6 w-6 shrink-0 overflow-hidden border border-border bg-background">
      <Image
        src={src}
        alt={name}
        fill
        className="object-contain"
        onError={() => {}}
        sizes="24px"
      />
    </div>
  );
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-muted">
      <span className="  text-[9px] text-muted-foreground">{letters}</span>
    </div>
  );
}

interface ExperienceItemProps {
  experience: Experience;
}

export function ExperienceItem({ experience }: ExperienceItemProps) {
  const [position] = experience.positions;
  const periodEnd = position.employmentPeriod.end ?? "∞";

  return (
    <Accordion className="w-full group">
      <AccordionItem value={experience.id}>
        <AccordionTrigger className="py-3 hover:no-underline">
          <div className="flex flex-1 items-center gap-3 min-w-0">
            {experience.companyLogo ? (
              <CompanyLogo
                src={experience.companyLogo}
                name={experience.companyName}
              />
            ) : (
              <Initials name={experience.companyName} />
            )}
            <span className="text-[14px] font-semibold text-foreground shrink-0">
              {experience.companyName}
            </span>
            {experience.isCurrentEmployer && (
              <span className="  text-[10px] text-brand-green border border-brand-green/40 px-1.5 py-px shrink-0">
                current
              </span>
            )}
            <span className="text-[14px] text-muted-foreground truncate hidden sm:block">
              {position.title}
            </span>
            <span className="ml-auto transition-colors group-hover:text-brand-green  text-[12px] text-muted-foreground shrink-0 pr-2">
              {position.employmentPeriod.start} → {periodEnd}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="flex flex-col gap-3 pl-9">
            {/* Mobile role */}
            <p className="text-[13px] text-muted-foreground sm:hidden">
              {position.title}
            </p>

            {/* Description */}
            <div className="prose-sm prose dark:prose-invert">
              <Markdown content={position.description} />
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {position.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>

            {/* Company link */}
            {experience.companyWebsite && (
              <a
                href={experience.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="  text-[12px] text-muted-foreground transition-colors hover:text-brand-green"
              >
                ↗ {experience.companyWebsite.replace(/https?:\/\/(www\.)?/, "")}
              </a>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

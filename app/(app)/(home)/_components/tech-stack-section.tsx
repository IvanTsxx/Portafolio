"use client";

import { motion } from "motion/react";
import Image from "next/image";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { TECH_STACK } from "@/shared/config/tech-stack";

import { SectionHeader } from "./section-header";

function TechItem({ item }: { item: (typeof TECH_STACK)[0] }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <motion.a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.title}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="group flex h-9 w-9 items-center justify-center border border-border transition-colors hover:border-brand-green"
          />
        }
      >
        {item.iconUrl ? (
          <Image
            src={item.iconUrl}
            alt={item.title}
            width={20}
            height={20}
            className="object-contain"
            style={{ filter: "grayscale(0%)" }}
            // oxlint-disable-next-line no-empty-function
            onError={() => {}}
          />
        ) : (
          <span className="  text-[10px] text-muted-foreground">
            {item.title[0]}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p className="  text-xs">{item.title}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function TechStackSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader label="Stack" />
      <TooltipProvider delay={80}>
        <motion.div
          className="flex flex-wrap gap-2"
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.2, once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.03 } },
          }}
        >
          {TECH_STACK.map((item) => (
            <motion.div
              key={item.key}
              variants={{
                hidden: { opacity: 0, y: 6 },
                show: { opacity: 1, transition: { duration: 0.3 }, y: 0 },
              }}
            >
              <TechItem item={item} />
            </motion.div>
          ))}
        </motion.div>
      </TooltipProvider>
    </section>
  );
}

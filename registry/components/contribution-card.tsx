"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitPullRequest } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";


export interface ProcessedContribution {
  title: string;
  description: string;
  repository: string;
  link: string;
  date: string;
  type: "feature" | "fix" | "perf" | "docs" | "refactor" | "test" | "chore";
  state: "open" | "closed" | "merged";
  kind: "pr" | "issue";
}

const contribution: ProcessedContribution = {
  date:"2022-01-01",
  description: "feat: add contribution card",
  kind:"pr",
  link:"https://github.com/ivantsxx/portafolio",
  repository:"ivantsxx/portafolio",
  state:"open",
  title: "feat: add contribution card",
  type:"feature",
}


export default function ContributionCard({
  index,
}: {
  index: number;
}) {
  return (
    <motion.div
      key={contribution.title}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      className="group flex items-start gap-3 border-b border-border py-3 transition-colors last:border-0 hover:text-brand-green"
    >
      <GitPullRequest
        className="mt-0.5 h-[14px] w-[14px] shrink-0 text-muted-foreground transition-colors group-hover:text-brand-green"
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="text-[13px] font-medium text-foreground transition-colors group-hover:text-brand-green truncate">
          {contribution.title}
        </span>
        <span className="transition-colors group-hover:brightness-100 group-hover:text-foreground  text-[11px] text-muted-foreground">
          {contribution.repository}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <span className="transition-colors group-hover:text-brand-green text-[11px] text-muted-foreground">
          {contribution.date}
        </span>

        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                prefetch={false}
                href={contribution.link as Route}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLink
              className="h-[12px] transition-colors group-hover:text-brand-green w-[12px] text-muted-foreground"
              aria-hidden="true"
            />
          </TooltipTrigger>
          <TooltipContent>View contribution</TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}

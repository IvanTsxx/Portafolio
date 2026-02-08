"use client";

import { ExternalLink, Github } from "lucide-react";

interface ProjectActionsProps {
  demoUrl?: string | null;
  githubUrl?: string | null;
}

export function ProjectActions({ demoUrl, githubUrl }: ProjectActionsProps) {
  if (!demoUrl && !githubUrl) return null;

  return (
    <div className="mt-4 flex items-center gap-2">
      {demoUrl && (
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border/40 bg-background/80 px-2.5 py-1.5 text-muted-foreground text-xs transition-all hover:border-primary/20 hover:text-primary"
          onClick={(e) => {
            e.preventDefault();
            window.open(demoUrl, "_blank");
          }}
        >
          <ExternalLink className="size-3.5" />
          Demo
        </button>
      )}
      {githubUrl && (
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border/40 bg-background/80 px-2.5 py-1.5 text-muted-foreground text-xs transition-all hover:border-primary/20 hover:text-primary"
          onClick={(e) => {
            e.preventDefault();
            window.open(githubUrl, "_blank");
          }}
        >
          <Github className="size-3.5" />
          Código
        </button>
      )}
    </div>
  );
}

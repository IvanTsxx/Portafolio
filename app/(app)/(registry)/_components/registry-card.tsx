import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { InstallCommand } from "./install-command";

export interface RegistryCardEntry {
  name: string;
  title: string;
  description: string;
  type: "component" | "block";
  /** Optional JSX to render as a live preview */
  preview?: React.ReactNode;
}

interface RegistryCardProps {
  entry: RegistryCardEntry;
  basePath: string;
}

export function RegistryCard({ entry, basePath }: RegistryCardProps) {
  const { name, title, description, preview } = entry;

  return (
    <div className="flex flex-col border border-border">
      {/* Preview */}
      <div className="flex items-center justify-center border-b border-border bg-secondary/40">
        {preview ?? (
          <span className="text-[11px] text-muted-foreground">No preview</span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-col gap-3 p-3">
        <div>
          <p className="text-[14px] font-semibold leading-none text-foreground">
            {title}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground leading-snug">
            {description}
          </p>
        </div>

        {/* Install command */}
        <InstallCommand name={name} />

        {/* View link */}
        <Link
          prefetch={false}
          href={`${basePath}/${name}`}
          className="inline-flex items-center gap-1   text-[12px] text-muted-foreground hover:text-foreground transition-colors self-end"
        >
          View <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

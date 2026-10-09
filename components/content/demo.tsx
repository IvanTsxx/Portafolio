import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface DemoProps {
  caption?: ReactNode;
  children?: ReactNode;
  className?: string;
  height?: number;
  src?: string;
  title: string;
}

export const Demo = ({
  caption,
  children,
  className,
  height = 480,
  src,
  title,
}: DemoProps) => (
  <figure className={cn("my-10", className)}>
    <div className="border-rule overflow-hidden rounded-sm border">
      <p className="label border-rule bg-graphite text-muted-foreground flex items-center justify-between gap-4 border-b px-4 py-3">
        <span className="truncate">{title}</span>
        <span className="text-muted-foreground shrink-0">Demo</span>
      </p>
      {src ? (
        <iframe
          className="bg-background block w-full"
          height={height}
          loading="lazy"
          sandbox="allow-scripts"
          src={src}
          title={title}
        />
      ) : (
        <div className="blueprint-dots bg-card grid min-h-48 place-items-center p-6">
          {children ?? <p className="label text-muted-foreground">Demo slot</p>}
        </div>
      )}
    </div>
    {caption ? (
      <figcaption className="text-muted-foreground mt-3 text-sm text-pretty">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface VideoProps {
  alt: string;
  captionsSrc?: string;
  caption?: ReactNode;
  className?: string;
  height: number;
  poster?: string;
  src: string;
  width: number;
}

export const Video = ({
  alt,
  caption,
  captionsSrc,
  className,
  height,
  poster,
  src,
  width,
}: VideoProps) => (
  <figure className={cn("my-10", className)}>
    <div className="border-rule bg-card overflow-hidden rounded-sm border">
      <video
        aria-label={alt}
        className="h-auto w-full"
        controls
        height={height}
        muted
        playsInline
        poster={poster}
        preload="metadata"
        src={src}
        width={width}
      >
        {captionsSrc ? (
          <track default kind="captions" src={captionsSrc} srcLang="en" />
        ) : null}
      </video>
    </div>
    {caption ? (
      <figcaption className="text-muted-foreground mt-3 text-sm text-pretty">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

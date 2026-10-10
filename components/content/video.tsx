import type { ReactNode } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
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
    <div className="border-rule-strong bg-popover relative border p-2">
      <CornerMarks />
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
      <figcaption className="label text-graphite mt-3 normal-case">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

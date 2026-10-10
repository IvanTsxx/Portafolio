import Image from "next/image";
import type { ImageProps } from "next/image";
import type { ReactNode } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { cn } from "@/lib/utils";

export type FigureProps = ImageProps & {
  caption?: ReactNode;
};

export const Figure = ({
  caption,
  className,
  sizes,
  ...image
}: FigureProps) => (
  <figure className={cn("my-10", className)}>
    <div className="border-rule-strong bg-popover relative border p-2">
      <CornerMarks />
      <Image
        className="h-auto w-full"
        sizes={sizes ?? "(min-width: 1024px) 720px, 100vw"}
        {...image}
      />
    </div>
    {caption ? (
      <figcaption className="label text-graphite mt-3 normal-case">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

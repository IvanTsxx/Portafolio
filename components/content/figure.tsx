import Image from "next/image";
import type { ImageProps } from "next/image";
import type { ReactNode } from "react";

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
    <div className="border-rule bg-card overflow-hidden rounded-sm border">
      <Image
        className="h-auto w-full"
        sizes={sizes ?? "(min-width: 1024px) 720px, 100vw"}
        {...image}
      />
    </div>
    {caption ? (
      <figcaption className="text-muted-foreground mt-3 text-sm text-pretty">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

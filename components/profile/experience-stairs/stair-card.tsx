import Image from "next/image";

import { cn } from "@/lib/utils";

import type { Stair } from "./stairs-model";

export const StairCard = ({
  className,
  stair,
}: {
  className?: string;
  stair: Stair;
}) => (
  <div
    className={cn(
      "bg-paper border-rule-strong flex w-80 items-center gap-3 border p-3 text-left",
      stair.isCurrent && "border-ink",
      className
    )}
  >
    <Image
      alt=""
      className="border-rule-strong size-10 shrink-0 border object-cover grayscale"
      height={40}
      src={stair.logo}
      width={40}
    />
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="text-ink m-0 text-base leading-tight font-medium tracking-tight">
        {stair.company}
      </p>
      <p className="label text-graphite m-0">
        {stair.role}
        <span className="text-mist"> · {stair.type}</span>
      </p>
      <p className="label text-ink m-0 tabular-nums">{stair.dates}</p>
    </div>
  </div>
);

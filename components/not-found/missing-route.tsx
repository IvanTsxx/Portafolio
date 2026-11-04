"use client";

import { usePathname } from "next/navigation";

export const MissingRoute = () => (
  <span className="text-foreground break-all">{usePathname()}</span>
);

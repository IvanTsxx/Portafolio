"use client";

import { usePathname } from "next/navigation";

export const MissingRoute = () => (
  <span className="text-ink break-all">{usePathname()}</span>
);

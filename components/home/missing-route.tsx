"use client";

import { usePathname } from "next/navigation";

export const MissingRoute = () => {
  const pathname = usePathname();
  return <span className="text-foreground break-all">{pathname}</span>;
};

"use client";

import { useTheme } from "next-themes";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      aria-label="Toggle color theme"
      className={cn(
        "group/theme text-muted-foreground hover:text-foreground relative grid size-11 place-items-center transition-colors duration-200",
        focusRingClassName,
        className
      )}
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      type="button"
    >
      <svg
        aria-hidden
        className="ease-out-expo size-4 transition-transform duration-500 group-hover/theme:rotate-45 dark:rotate-180 dark:group-hover/theme:rotate-225"
        fill="none"
        viewBox="0 0 16 16"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" />
        <path d="M8 1a7 7 0 0 1 0 14Z" fill="currentColor" />
      </svg>
    </button>
  );
};

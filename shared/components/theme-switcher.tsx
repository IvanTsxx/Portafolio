"use client";

import { MonitorIcon, MoonStarIcon, SunIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import type { JSX } from "react";
import { useCallback, useSyncExternalStore } from "react";

import { cn } from "@/shared/lib/utils";

import { triggerThemeTransition } from "./theme-provider";

function ThemeOption({
  icon,
  value,
  isActive,
  onClick,
}: {
  icon: JSX.Element;
  value: string;
  isActive?: boolean;
  onClick: (value: string, event: React.MouseEvent) => void;
}) {
  return (
    <button
      className={cn(
        "relative flex size-8 cursor-default items-center justify-center rounded-full transition-[color] [&_svg]:size-4",
        isActive
          ? "text-zinc-950 dark:text-zinc-50"
          : "text-zinc-400 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-50"
      )}
      role="radio"
      aria-checked={isActive}
      aria-label={`Switch to ${value} theme`}
      onClick={(e) => onClick(value, e)}
    >
      {icon}

      {isActive && (
        <motion.div
          layoutId="theme-option"
          transition={{ bounce: 0.3, duration: 0.6, type: "spring" }}
          className="absolute inset-0 rounded-full border border-zinc-200 dark:border-zinc-700"
        />
      )}
    </button>
  );
}

const THEME_OPTIONS = [
  { icon: <MonitorIcon />, value: "system" },
  { icon: <MoonStarIcon />, value: "dark" },
  { icon: <SunIcon />, value: "light" },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = useCallback(
    (newTheme: string, event: React.MouseEvent) => {
      triggerThemeTransition(setTheme, newTheme, event.clientX, event.clientY);
    },
    [setTheme]
  );

  const isMounted = useSyncExternalStore(
    // oxlint-disable-next-line no-empty-function
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return <div className="flex h-8 w-24" />;
  }

  return (
    <motion.div
      key={String(isMounted)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 5 * 0.1, duration: 0.5 }}
      className="inline-flex items-center overflow-hidden rounded-full bg-white ring-1 ring-zinc-200 ring-inset dark:bg-zinc-950 dark:ring-zinc-700"
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => (
        <ThemeOption
          key={option.value}
          icon={option.icon}
          value={option.value}
          isActive={theme === option.value}
          onClick={handleThemeChange}
        />
      ))}
    </motion.div>
  );
}

export { ThemeSwitcher };

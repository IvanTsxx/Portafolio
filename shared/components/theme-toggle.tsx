"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { useThemeTransition } from "@/shared/hooks/use-theme-transition";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { changeTheme, theme } = useThemeTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full active:scale-90 transition-transform duration-150"
      onClick={(e) => changeTheme(theme === "dark" ? "light" : "dark", e)}
    >
      {theme === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </Button>
  );
}

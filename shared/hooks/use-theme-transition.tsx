"use client";
import { useTheme } from "next-themes";

export function useThemeTransition() {
  const { setTheme, theme } = useTheme();

  const changeTheme = (newTheme: string) => {
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  };
  return { changeTheme, theme };
}

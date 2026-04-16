"use client";
import { useTheme } from "next-themes";

export function useThemeTransition() {
  const { setTheme, theme } = useTheme();

  const changeTheme = (newTheme: string, e?: React.MouseEvent) => {
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;

    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);

    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  };

  return { changeTheme, theme };
}

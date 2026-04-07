export function triggerThemeTransition(
  setTheme: (theme: string) => void,
  newTheme: string,
  x = window.innerWidth / 2,
  y = window.innerHeight / 2
) {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);

    (
      document as Document & { startViewTransition: (cb: () => void) => void }
    ).startViewTransition(() => {
      setTheme(newTheme);
    });
  } else {
    setTheme(newTheme);
  }
}

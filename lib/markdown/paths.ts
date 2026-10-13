export const markdownPathOf = <Path extends `/${string}`>(pagePath: Path) =>
  `${pagePath}.md` as const;

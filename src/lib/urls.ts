export function normalize(urlOrPath: string) {
  if (urlOrPath.length > 1 && urlOrPath.endsWith("/")) {
    return urlOrPath.slice(0, -1);
  }
  return urlOrPath;
}

/**
 * @returns if `href` is matching the given pathname
 */
export function isActive(
  href: string,
  pathname: string,
  nested = false
): boolean {
  const normalizeHref = normalize(href);
  const normalizePathname = normalize(pathname);

  return (
    normalizeHref === normalizePathname ||
    (nested && normalizePathname.startsWith(`${normalizeHref}/`))
  );
}

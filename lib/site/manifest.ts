export type ManifestKind = "css" | "file" | "package" | "registry";

export type ManifestGlyph =
  | "css"
  | "file"
  | "md"
  | "package"
  | "registry"
  | "ts"
  | "tsx";

export interface ManifestEntry {
  detail?: string;
  href?: string;
  kind: ManifestKind;
  name: string;
}

const fileGlyphs = {
  css: "css",
  md: "md",
  mdx: "md",
  ts: "ts",
  tsx: "tsx",
} as const satisfies Record<string, ManifestGlyph>;

const isKnownExtension = (
  extension: string
): extension is keyof typeof fileGlyphs => extension in fileGlyphs;

export const glyphOf = ({ kind, name }: ManifestEntry): ManifestGlyph => {
  if (kind !== "file") {
    return kind;
  }
  const extension = name.split(".").at(-1) ?? "";
  return isKnownExtension(extension) ? fileGlyphs[extension] : "file";
};

export const packageEntry = (dependency: string): ManifestEntry => {
  const versionAt = dependency.lastIndexOf("@");
  return versionAt > 0
    ? {
        detail: dependency.slice(versionAt + 1),
        kind: "package",
        name: dependency.slice(0, versionAt),
      }
    : { kind: "package", name: dependency };
};

export const fileEntry = (path: string, href?: string): ManifestEntry => {
  const segments = path.split("/");
  const name = segments.at(-1) ?? path;
  const folder = segments.at(-2);
  return { detail: folder, href, kind: "file", name };
};

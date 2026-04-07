// oxlint-disable promise/prefer-await-to-callbacks
// oxlint-disable promise/prefer-await-to-then
import { promises as fs } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "r");

/**
 * Derive target path based on file type and source path
 */
function deriveTarget(filePath: string, fileType: string): string {
  // Only derive target for blocks and pages
  if (fileType !== "registry:block" && fileType !== "registry:page") {
    return "";
  }

  // Extract the registry path (e.g., "blocks/ivantsx/hero-01/index.tsx")
  const match = filePath.match(
    /^(registry\/)?(blocks|app)\/(.+?)(\/index|\/page)?\.tsx?$/
  );
  if (!match) return "";

  const [_, __, dirName, rest] = match;
  const parts = rest.split("/");

  if (dirName === "blocks") {
    // Check if namespaced (e.g., "ivantsx/hero-01")
    if (parts.length >= 2) {
      const [___, author] = parts;
      const name = parts.slice(1).join("/");
      if (filePath.includes("/_components/")) {
        const [____, componentFile] = filePath.split("/_components/");
        return `blocks/${author}/${name}/_components/${componentFile}`;
      }
      if (filePath.includes("/_actions.")) {
        return `blocks/${author}/${name}/_actions.${filePath.endsWith(".tsx") ? "tsx" : "ts"}`;
      }
      if (filePath.includes("/_validations.")) {
        return `blocks/${author}/${name}/_validations.tsx`;
      }
      return `blocks/${author}/${name}/index.tsx`;
    }
    // Non-namespaced block
    return filePath.replace(/^registry\//, "");
  }

  if (dirName === "app") {
    // Pages go to app/{name}/page.tsx
    return `app/${rest}/page.tsx`;
  }

  return "";
}

async function run() {
  const files = await fs.readdir(dir);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(dir, file);
      const rawContent = await fs.readFile(filePath, "utf-8");

      try {
        const item = JSON.parse(rawContent);

        if (item.files && Array.isArray(item.files)) {
          for (const f of item.files) {
            // Derive target if not present
            if (!f.target && f.path) {
              f.target = deriveTarget(f.path, f.type);
            }

            if (typeof f.content === "string") {
              // shadcn CLI transforms @/components/* to the user's configured alias automatically
              // based on their components.json. For distribution, we convert user's custom aliases
              // (@/shared/components, @/shared/lib, etc.) to standard @/components so shadcn can
              // transform them to the installer's configured aliases on install.

              // Convert user's custom aliases to standard shadcn aliases
              f.content = f.content.replaceAll(
                "@/shared/components",
                "@/components"
              );
              f.content = f.content.replaceAll(
                "@/shared/components/ui",
                "@/components/ui"
              );
              f.content = f.content.replaceAll("@/shared/lib", "@/lib");
              f.content = f.content.replaceAll("@/shared/hooks", "@/hooks");

              // Auto-fix imports relativos entre componentes registry (e.g. from "../components/theme-switcher")
              f.content = f.content.replaceAll(
                /from ['"]\.\.\/components\/([^'"]+)['"]/g,
                'from "@/components/$1"'
              );
              f.content = f.content.replaceAll(
                /from ['"]\.\.\/ui\/([^'"]+)['"]/g,
                'from "@/components/ui/$1"'
              );
              f.content = f.content.replaceAll(
                /from ['"]\.\.\/hooks\/([^'"]+)['"]/g,
                'from "@/hooks/$1"'
              );
              f.content = f.content.replaceAll(
                /from ['"]\.\.\/lib\/([^'"]+)['"]/g,
                'from "@/lib/$1"'
              );

              // Fallback for flat relatives (from "./theme-switcher" or from "../theme-provider")
              f.content = f.content.replaceAll(
                /from ['"]\.\.\/([^'"]+)['"]/g,
                'from "@/components/$1"'
              );
              f.content = f.content.replaceAll(
                /from ['"]\.\/([^'"]+)['"]/g,
                'from "@/components/$1"'
              );
            }
          }
        }

        await fs.writeFile(filePath, JSON.stringify(item, null, 2), "utf-8");
      } catch (e) {
        console.error(`Error parsing JSON for file ${file}:`, e);
      }
    }
  }
  console.log("Registry imports normalizados para distribucion externa. ✅");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

// oxlint-disable promise/prefer-await-to-callbacks
// oxlint-disable promise/prefer-await-to-then
import { promises as fs } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "r");

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
            if (typeof f.content === "string") {
              // Normalizamos rutas personalizadas al estándar esperado por shadcn CLI
              f.content = f.content.replaceAll("@/shared/lib", "@/lib");
              f.content = f.content.replaceAll(
                "@/shared/components/ui",
                "@/components/ui"
              );
              f.content = f.content.replaceAll(
                "@/shared/components",
                "@/components"
              );
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

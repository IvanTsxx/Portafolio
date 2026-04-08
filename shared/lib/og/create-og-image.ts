import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "@takumi-rs/image-response";

import { OG_SIZE } from "./og-layout";

// ── createOgImage ─────────────────────────────────────────────────────────────

/**
 * Wraps `ImageResponse` with shared avatar loading.
 *
 * Uses Takumi's built-in Geist font (no manual loading needed).
 *
 * @param render - Receives `avatarSrc` (or null) and returns the JSX tree.
 *
 * @example
 * export default function Image() {
 *   return createOgImage(({ avatarSrc }) => (
 *     <OgLayout topBar={{ label: "PORTFOLIO" }} avatarSrc={avatarSrc}>
 *       ...
 *     </OgLayout>
 *   ));
 * }
 */
export async function createOgImage(
  render: (ctx: { avatarSrc: string | null }) => React.ReactElement
): Promise<ImageResponse> {
  // Load avatar (base64 data URI)
  let avatarSrc: string | null = null;
  const candidates = ["avatar.webp", "avatar.jpeg", "avatar.jpg", "avatar.png"];
  for (const file of candidates) {
    try {
      const buf = await readFile(path.join(process.cwd(), "public", file));
      const ext = file.split(".").pop()!;
      const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
      avatarSrc = `data:${mime};base64,${buf.toString("base64")}`;
      break;
    } catch {
      // try next
    }
  }

  // Takumi has Geist embedded by default - no font loading needed
  return new ImageResponse(render({ avatarSrc }), {
    height: OG_SIZE.height,
    width: OG_SIZE.width,
  });
}

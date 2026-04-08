#!/usr/bin/env node

/**
 * Script to generate a screenshot-based OG image for the home page.
 *
 * This script:
 * 1. Launches a headless browser
 * 2. Takes a screenshot of the home page
 * 3. Saves it as the home OG image (WebP format)
 *
 * Usage:
 *   bun run scripts/generate-home-og.ts
 *   or
 *   npx tsx scripts/generate-home-og.ts
 *
 * Requirements:
 *   - playwright (install with: bun add -d playwright @playwright/test)
 *   - Run: bunx playwright install chromium
 */

import type { chromium } from "playwright";

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = join(process.cwd(), "public", "og");
const OUTPUT_FILE = join(OUTPUT_DIR, "home.png");
const HOME_URL = process.env.OG_HOME_URL || "http://localhost:3000";

async function main() {
  console.log("🎨 Generating Home OG Image from screenshot...\n");

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}`);
  }

  // Check if Playwright is available
  let browserImpl: typeof chromium | null = null;
  try {
    const playwright = await import("playwright");
    browserImpl = playwright.chromium;
  } catch {
    console.error(
      "❌ Playwright is not installed.\n" +
        "   Install it with: bun add -d playwright @playwright/test\n" +
        "   Then run: bunx playwright install chromium\n"
    );
    process.exit(1);
  }

  console.log(`📸 Taking screenshot of: ${HOME_URL}`);
  console.log("   (Set OG_HOME_URL env var to change URL)\n");

  const browser = await browserImpl.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { height: 630, width: 1200 },
  });
  const page = await context.newPage();

  try {
    await page.goto(HOME_URL, { timeout: 30_000, waitUntil: "networkidle" });

    // Wait a bit for any animations to settle
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({
      clip: { height: 630, width: 1200, x: 0, y: 0 },
      fullPage: false,
      type: "png",
    });

    writeFileSync(OUTPUT_FILE, screenshot);
    console.log(`✅ Screenshot saved to: ${OUTPUT_FILE}`);
    console.log(`   Dimensions: 1200x630 (PNG)`);
    console.log(`\n✨ Home OG image generated successfully!`);
    console.log(
      `   This is optional - the programmatic OG image is already configured.`
    );
  } catch (error) {
    console.error("❌ Failed to take screenshot:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}

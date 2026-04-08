#!/usr/bin/env node

/**
 * Script to generate a screenshot-based OG image for the home page.
 *
 * Usage:
 *   bun run scripts/generate-home-og.ts
 *
 * Requirements:
 *   - puppeteer (install with: bun add -d puppeteer)
 */

import fs from "node:fs";
import path from "node:path";

import puppeteer from "puppeteer";

import { env } from "@/env/server";

const OUTPUT_DIR = path.join(process.cwd(), "public", "og");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "home.png");
const HOME_URL = env.BETTER_AUTH_URL || "http://localhost:3000";

async function main() {
  console.log("🎨 Generating Home OG Image from screenshot...\n");

  // Ensure output directory exists
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  console.log(`📸 Taking screenshot of: ${HOME_URL}`);
  console.log("   (Set OG_HOME_URL env var to change URL)\n");

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // OG image size
    await page.setViewport({
      height: 630,
      width: 1200,
    });

    // Navigate and wait for network to be idle
    await page.goto(HOME_URL, { waitUntil: "networkidle2" });

    // Screenshot
    await page.screenshot({
      path: OUTPUT_FILE,
      type: "png",
    });

    console.log(`✅ Screenshot saved to: ${OUTPUT_FILE}`);
    console.log(`   Dimensions: 1200x630 (PNG)`);
    console.log(`\n✨ Home OG image generated successfully!`);

    await page.close();
  } catch (error) {
    console.error("❌ Failed to take screenshot:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

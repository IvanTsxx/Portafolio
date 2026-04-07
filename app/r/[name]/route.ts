import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

const PUBLIC_REGISTRY_PATH = path.join(process.cwd(), "public/r");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const filePath = path.join(PUBLIC_REGISTRY_PATH, `${name}.json`);

  try {
    const content = await fs.readFile(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: `Registry item "${name}" not found` },
      { status: 404 }
    );
  }
}
